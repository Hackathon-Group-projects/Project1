/**
 * ═══════════════════════════════════════════════════════════════
 *  SecAudit — GitHub PR Commenter
 *  Posts inline review comments on PRs with AI-generated fixes.
 *  Uses GitHub REST API with the built-in GITHUB_TOKEN.
 *
 *  Flow:
 *    1. Read scan results JSON
 *    2. Generate AI fixes via Gemini
 *    3. Post PR review with REQUEST_CHANGES (if HIGH/CRITICAL found)
 *    4. Each finding becomes an inline comment at the exact line
 * ═══════════════════════════════════════════════════════════════
 */

const https = require("https");
const { generateAiFixes, formatAsGitHubComment } = require("./ai-fix");

/**
 * Make a GitHub API request.
 */
function githubRequest(method, endpoint, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path: endpoint,
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "SecAudit-CI-Bot/1.0",
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(
              new Error(
                `GitHub API ${res.statusCode}: ${parsed.message || data}`
              )
            );
          } else {
            resolve(parsed);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Get the list of changed files in a PR.
 */
async function getPRChangedFiles(owner, repo, prNumber, token) {
  const files = await githubRequest(
    "GET",
    `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`,
    token
  );
  return files.map((f) => ({
    filename: f.filename,
    status: f.status,
    patch: f.patch || "",
    additions: f.additions,
  }));
}

/**
 * Get the latest commit SHA for the PR (needed for review comments).
 */
async function getPRHeadSha(owner, repo, prNumber, token) {
  const pr = await githubRequest(
    "GET",
    `/repos/${owner}/${repo}/pulls/${prNumber}`,
    token
  );
  return pr.head.sha;
}

/**
 * Parse a patch to find which lines are added (and their positions in the diff).
 * Returns a map: original_line_number → diff_position
 */
function parsePatchPositions(patch) {
  if (!patch) return {};

  const lines = patch.split("\n");
  const positions = {};
  let currentLine = 0;
  let diffPosition = 0;

  for (const line of lines) {
    diffPosition++;

    // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
    const hunkMatch = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentLine = parseInt(hunkMatch[1]) - 1;
      continue;
    }

    if (line.startsWith("+")) {
      currentLine++;
      positions[currentLine] = diffPosition;
    } else if (line.startsWith("-")) {
      // Deleted line — don't increment currentLine
    } else {
      currentLine++;
      positions[currentLine] = diffPosition;
    }
  }

  return positions;
}

/**
 * Post a PR review with inline comments at vulnerability locations.
 *
 * @param {Object} options
 * @param {string} options.owner      — Repository owner
 * @param {string} options.repo       — Repository name
 * @param {number} options.prNumber   — Pull request number
 * @param {string} options.token      — GitHub token
 * @param {string} options.geminiKey  — Gemini API key
 * @param {Array}  options.findings   — Scan findings
 * @param {Array}  options.changedFiles — PR changed files with patches
 */
async function postPRReview(options) {
  const { owner, repo, prNumber, token, geminiKey, findings, changedFiles } =
    options;

  if (findings.length === 0) {
    // Post a success comment
    await githubRequest(
      "POST",
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      token,
      {
        event: "APPROVE",
        body: `## 🛡️ SecAudit Security Scan — ✅ PASSED

No security vulnerabilities detected in this PR. Good job! 🎉

---
<sub>Powered by <b>Secura</b> DevSecOps Pipeline | AI-Augmented Security Scanner</sub>`,
      }
    );
    console.log("✅ Posted approval review — no vulnerabilities found");
    return;
  }

  // Get AI-generated fixes
  console.log("🤖 Generating AI-powered fix suggestions...");
  const fixes = await generateAiFixes(findings, geminiKey);

  // Get the head SHA for the review
  const commitSha = await getPRHeadSha(owner, repo, prNumber, token);

  // Build patch position maps for all changed files
  const patchPositions = {};
  for (const file of changedFiles) {
    patchPositions[file.filename] = parsePatchPositions(file.patch);
  }

  // Build review comments (only for lines that exist in the diff)
  const reviewComments = [];
  const skippedFindings = [];

  for (const fix of fixes) {
    const filePositions = patchPositions[fix.file];
    if (!filePositions) {
      skippedFindings.push(fix);
      continue;
    }

    const position = filePositions[fix.line];
    if (!position) {
      // Line not in the diff — add to skipped
      skippedFindings.push(fix);
      continue;
    }

    reviewComments.push({
      path: fix.file,
      position: position,
      body: formatAsGitHubComment(fix),
    });
  }

  // Determine review event based on severity
  const hasCriticalOrHigh = findings.some(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  findings.forEach((f) => counts[f.severity]++);

  // Build the review body
  let reviewBody = `## 🛡️ SecAudit Security Scan — ${hasCriticalOrHigh ? "❌ BLOCKED" : "⚠️ WARNINGS"}

### Scan Summary
| Severity | Count |
|----------|-------|
| 🔴 CRITICAL | ${counts.CRITICAL} |
| 🟠 HIGH | ${counts.HIGH} |
| 🟡 MEDIUM | ${counts.MEDIUM} |
| 🔵 LOW | ${counts.LOW} |

**Total: ${findings.length} vulnerabilities** found across ${new Set(findings.map((f) => f.file)).size} file(s).
`;

  if (hasCriticalOrHigh) {
    reviewBody += `
> **⛔ This PR is blocked.** ${counts.CRITICAL} CRITICAL and ${counts.HIGH} HIGH severity issues must be resolved before merging.
> Check the inline comments below for AI-generated fix suggestions.
`;
  }

  // Add skipped findings (not in diff) as a summary
  if (skippedFindings.length > 0) {
    reviewBody += `
### ⚠️ Additional Issues (in existing code, not in this PR's diff)
${skippedFindings.map((f) => `- **${f.severity}** \`${f.file}:${f.line}\` — ${f.title} (${f.ruleId})`).join("\n")}
`;
  }

  reviewBody += `
---
<sub>🤖 AI fixes powered by <b>Google Gemini</b> | 🛡️ <b>Secura</b> DevSecOps Pipeline</sub>`;

  // Post the review
  try {
    await githubRequest(
      "POST",
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      token,
      {
        commit_id: commitSha,
        body: reviewBody,
        event: hasCriticalOrHigh ? "REQUEST_CHANGES" : "COMMENT",
        comments: reviewComments,
      }
    );

    console.log(
      `📝 Posted PR review with ${reviewComments.length} inline comments`
    );
    if (hasCriticalOrHigh) {
      console.log("⛔ PR marked as REQUEST_CHANGES — merge blocked");
    }
  } catch (err) {
    console.error(`❌ Failed to post review: ${err.message}`);

    // Fallback: post as a regular issue comment
    try {
      await githubRequest(
        "POST",
        `/repos/${owner}/${repo}/issues/${prNumber}/comments`,
        token,
        {
          body: reviewBody,
        }
      );
      console.log("📝 Posted scan results as a PR comment (fallback)");
    } catch (fallbackErr) {
      console.error(
        `❌ Fallback comment also failed: ${fallbackErr.message}`
      );
    }
  }
}

module.exports = { postPRReview, getPRChangedFiles, parsePatchPositions };
