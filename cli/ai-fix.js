/**
 * ═══════════════════════════════════════════════════════════════
 *  SecAudit — AI Fix Generator
 *  Uses Google Gemini to generate copy-paste-ready code fixes
 *  for detected security vulnerabilities.
 *
 *  Same Gemini API as the main Secura AI service.
 * ═══════════════════════════════════════════════════════════════
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generate AI-powered fix suggestions for a list of security findings.
 *
 * @param {Array} findings — Array of vulnerability findings from the scanner
 * @param {string} apiKey  — Google Gemini API key
 * @returns {Promise<Array<{ruleId: string, file: string, line: number, severity: string, title: string, originalCode: string, fixedCode: string, explanation: string}>>}
 */
async function generateAiFixes(findings, apiKey) {
  if (!apiKey) {
    console.error(
      "⚠️  GEMINI_API_KEY not provided — skipping AI fix generation"
    );
    return findings.map((f) => ({
      ...f,
      fixedCode: null,
      explanation: f.fix_hint,
    }));
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    },
  });

  const fixes = [];

  // Batch findings by file to reduce API calls
  const findingsByFile = {};
  for (const finding of findings) {
    if (!findingsByFile[finding.file]) {
      findingsByFile[finding.file] = [];
    }
    findingsByFile[finding.file].push(finding);
  }

  for (const [file, fileFindings] of Object.entries(findingsByFile)) {
    try {
      const prompt = buildFixPrompt(file, fileFindings);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse the AI response
      const parsedFixes = parseFixResponse(text, fileFindings);
      fixes.push(...parsedFixes);
    } catch (err) {
      console.error(`⚠️  AI fix generation failed for ${file}: ${err.message}`);
      // Fallback to rule-based hints
      fixes.push(
        ...fileFindings.map((f) => ({
          ...f,
          fixedCode: null,
          explanation: f.fix_hint,
        }))
      );
    }
  }

  return fixes;
}

/**
 * Build the Gemini prompt for generating fixes.
 */
function buildFixPrompt(file, findings) {
  const findingsText = findings
    .map(
      (f, i) => `
### Vulnerability ${i + 1}: ${f.title} [${f.severity}]
- **Rule**: ${f.ruleId} (${f.cwe})
- **File**: ${f.file}:${f.line}
- **Matched Code**: \`${f.matchedText}\`
- **Context**:
\`\`\`
${f.codeContext || "No context available"}
\`\`\`
- **Issue**: ${f.description}
- **Hint**: ${f.fix_hint}
`
    )
    .join("\n");

  return `You are a senior security engineer reviewing a pull request. For each vulnerability below, provide an exact, copy-paste-ready code fix.

## FILE: ${file}

${findingsText}

## YOUR TASK:
For each vulnerability, respond with this EXACT format (one block per vulnerability):

---FIX_START---
VULN_INDEX: <number>
EXPLANATION: <1-2 sentence explanation of what the fix does and why>
ORIGINAL:
\`\`\`
<exact vulnerable code snippet>
\`\`\`
FIXED:
\`\`\`
<fixed code — must be a drop-in replacement>
\`\`\`
---FIX_END---

## RULES:
- Each fix must be a DIRECT replacement — same functionality, just secure
- Use the language/framework conventions already in the file
- Include necessary import/require statements in the fixed code
- Be specific — no pseudocode, no TODOs, no placeholders
- If the vulnerability is a hardcoded secret, show the .env pattern
`;
}

/**
 * Parse Gemini's fix response into structured objects.
 */
function parseFixResponse(responseText, findings) {
  const fixes = [];
  const fixBlocks = responseText.split("---FIX_START---").slice(1);

  for (const block of fixBlocks) {
    const endIdx = block.indexOf("---FIX_END---");
    const content = endIdx !== -1 ? block.substring(0, endIdx) : block;

    // Parse VULN_INDEX
    const indexMatch = content.match(/VULN_INDEX:\s*(\d+)/);
    const vulnIndex = indexMatch ? parseInt(indexMatch[1]) - 1 : fixes.length;

    // Parse EXPLANATION
    const explanationMatch = content.match(
      /EXPLANATION:\s*(.*?)(?=\nORIGINAL:)/s
    );
    const explanation = explanationMatch
      ? explanationMatch[1].trim()
      : "Security fix applied.";

    // Parse ORIGINAL code block
    const originalMatch = content.match(
      /ORIGINAL:\s*```[\w]*\n([\s\S]*?)```/
    );
    const originalCode = originalMatch ? originalMatch[1].trim() : "";

    // Parse FIXED code block
    const fixedMatch = content.match(/FIXED:\s*```[\w]*\n([\s\S]*?)```/);
    const fixedCode = fixedMatch ? fixedMatch[1].trim() : "";

    const finding = findings[vulnIndex] || findings[fixes.length];

    if (finding) {
      fixes.push({
        ruleId: finding.ruleId,
        title: finding.title,
        severity: finding.severity,
        file: finding.file,
        line: finding.line,
        cwe: finding.cwe,
        owasp: finding.owasp,
        matchedText: finding.matchedText,
        originalCode: originalCode || finding.matchedText,
        fixedCode: fixedCode,
        explanation: explanation,
        description: finding.description,
      });
    }
  }

  // Fill in any findings that didn't get a fix block
  for (let i = fixes.length; i < findings.length; i++) {
    fixes.push({
      ...findings[i],
      originalCode: findings[i].matchedText,
      fixedCode: null,
      explanation: findings[i].fix_hint,
    });
  }

  return fixes;
}

/**
 * Format a fix as a GitHub suggestion comment body (markdown).
 */
function formatAsGitHubComment(fix) {
  const severityBadge = {
    CRITICAL: "🔴 **CRITICAL**",
    HIGH: "🟠 **HIGH**",
    MEDIUM: "🟡 **MEDIUM**",
    LOW: "🔵 **LOW**",
  };

  let comment = `## ${severityBadge[fix.severity] || fix.severity} — ${fix.title}

> **${fix.ruleId}** | ${fix.cwe} | ${fix.owasp}

${fix.description}

### 🤖 AI-Generated Fix

${fix.explanation}
`;

  if (fix.fixedCode) {
    comment += `
\`\`\`suggestion
${fix.fixedCode}
\`\`\`
`;
  } else {
    comment += `
**💡 Manual Fix Required:**
${fix.explanation || fix.fix_hint}
`;
  }

  comment += `
---
<sub>🛡️ Found by <b>SecAudit</b> — Secura DevSecOps Pipeline</sub>
`;

  return comment;
}

module.exports = { generateAiFixes, formatAsGitHubComment };
