/**
 * ═══════════════════════════════════════════════════════════════
 *  SecAudit — Security Rules Engine
 *  Static analysis pattern-matching rules for CI/CD vulnerability scanning
 *
 *  Each rule maps to CWE + OWASP Top 10 categories.
 *  Used by secaudit CLI and GitHub Action to block vulnerable PRs.
 * ═══════════════════════════════════════════════════════════════
 */

const rules = [
  // ── CRITICAL ───────────────────────────────────────────────
  {
    id: "SEC-001",
    title: "Hardcoded Secret / API Key",
    severity: "CRITICAL",
    pattern:
      /(?:api[_-]?key|apikey|secret[_-]?key|password|passwd|token|auth[_-]?token|access[_-]?key|private[_-]?key)\s*[:=]\s*['"`](?!process\.env)[A-Za-z0-9_\-/.+]{8,}['"`]/gi,
    cwe: "CWE-798",
    owasp: "A07:2021 – Identification and Authentication Failures",
    description:
      "Hardcoded credentials or API keys found in source code. Attackers can extract these from version control history even after deletion.",
    fix_hint:
      "Move the secret to an environment variable via .env file and access it with process.env.VARIABLE_NAME. Never commit secrets to git.",
  },
  {
    id: "SEC-002",
    title: "SQL Injection via String Concatenation",
    severity: "CRITICAL",
    pattern:
      /(?:query|execute|raw)\s*\(\s*['"`](?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b[^'"`]*['"`]\s*\+/gi,
    cwe: "CWE-89",
    owasp: "A03:2021 – Injection",
    description:
      "SQL query built via string concatenation with dynamic values. This is the #1 most exploited vulnerability class and allows full database takeover.",
    fix_hint:
      "Use parameterized queries or prepared statements. For Mongoose use schema validators. For raw SQL use placeholder syntax: query('SELECT * FROM users WHERE id = $1', [userId]).",
  },
  {
    id: "SEC-003",
    title: "Cross-Site Scripting (XSS) — Unsafe DOM Manipulation",
    severity: "CRITICAL",
    pattern:
      /(?:\.innerHTML\s*=|\.outerHTML\s*=|document\.write\s*\(|\.insertAdjacentHTML\s*\()\s*(?:[^'"`\s])/gi,
    cwe: "CWE-79",
    owasp: "A03:2021 – Injection",
    description:
      "Direct DOM manipulation with unsanitized content enables Cross-Site Scripting attacks, allowing attackers to steal cookies, session tokens, or redirect users.",
    fix_hint:
      "Use textContent instead of innerHTML. If HTML insertion is necessary, sanitize input with DOMPurify.sanitize() before insertion.",
  },

  // ── HIGH ───────────────────────────────────────────────────
  {
    id: "SEC-004",
    title: "Code Injection via eval() or Function Constructor",
    severity: "HIGH",
    pattern:
      /\b(?:eval|new\s+Function)\s*\(\s*(?:[a-zA-Z_$][\w$.]*|['"`].*['"`]\s*\+)/gi,
    cwe: "CWE-94",
    owasp: "A03:2021 – Injection",
    description:
      "Using eval() or new Function() with dynamic input allows arbitrary code execution. An attacker can inject any JavaScript code.",
    fix_hint:
      "Replace eval() with JSON.parse() for data parsing, or use a sandboxed interpreter. Avoid new Function() with user-controlled strings entirely.",
  },
  {
    id: "SEC-005",
    title: "Command Injection via child_process",
    severity: "HIGH",
    pattern:
      /(?:exec|execSync|spawn|spawnSync)\s*\(\s*(?:[`'"].*\$\{|[a-zA-Z_$][\w$.]*\s*\+|`[^`]*\$\{)/gi,
    cwe: "CWE-78",
    owasp: "A03:2021 – Injection",
    description:
      "Shell command built with user-controlled input via child_process. Attackers can chain commands using ; or && to execute arbitrary system commands.",
    fix_hint:
      "Use execFile() or spawn() with argument arrays instead of exec() with string interpolation. Always validate and sanitize inputs before passing to shell commands.",
  },
  {
    id: "SEC-006",
    title: "Missing Security Headers (No Helmet)",
    severity: "HIGH",
    pattern:
      /app\s*=\s*express\s*\(\s*\)(?:(?!helmet)[\s\S]){0,500}app\.listen/gi,
    cwe: "CWE-693",
    owasp: "A05:2021 – Security Misconfiguration",
    description:
      "Express.js app created without Helmet middleware. This leaves the app vulnerable to clickjacking, MIME sniffing, and other header-based attacks.",
    fix_hint:
      "Add helmet() middleware immediately after creating the Express app: const helmet = require('helmet'); app.use(helmet());",
  },
  {
    id: "SEC-007",
    title: "Insecure Cryptographic Algorithm",
    severity: "HIGH",
    pattern:
      /(?:createHash|createHmac)\s*\(\s*['"`](?:md5|sha1|md4|md2|ripemd)['"`]\s*\)/gi,
    cwe: "CWE-327",
    owasp: "A02:2021 – Cryptographic Failures",
    description:
      "Weak hashing algorithm (MD5/SHA1) used. These are cryptographically broken and vulnerable to collision attacks. Never use for passwords or integrity checks.",
    fix_hint:
      "Use SHA-256 or SHA-3 for integrity hashing: crypto.createHash('sha256'). For passwords, use bcrypt, scrypt, or argon2.",
  },

  // ── MEDIUM ─────────────────────────────────────────────────
  {
    id: "SEC-008",
    title: "Path Traversal — Unsanitized File Access",
    severity: "MEDIUM",
    pattern:
      /(?:readFileSync|readFile|createReadStream|writeFileSync|writeFile|createWriteStream|unlink|unlinkSync)\s*\(\s*(?:[a-zA-Z_$][\w$.]*\s*\+|`[^`]*\$\{|req\.|request\.)/gi,
    cwe: "CWE-22",
    owasp: "A01:2021 – Broken Access Control",
    description:
      "File system operation uses unsanitized user input, enabling path traversal attacks (../../etc/passwd). Attackers can read or overwrite arbitrary files.",
    fix_hint:
      "Use path.resolve() and verify the resolved path starts with the expected base directory: const safePath = path.resolve(baseDir, userInput); if (!safePath.startsWith(baseDir)) throw new Error('Invalid path');",
  },
  {
    id: "SEC-009",
    title: "Server-Side Request Forgery (SSRF)",
    severity: "MEDIUM",
    pattern:
      /(?:fetch|axios\.get|axios\.post|http\.get|https\.get|request|got)\s*\(\s*(?:req\.|request\.|params\.|query\.|body\.)/gi,
    cwe: "CWE-918",
    owasp: "A10:2021 – Server-Side Request Forgery",
    description:
      "HTTP request made using user-controlled URL without validation. Attackers can probe internal services, cloud metadata APIs (169.254.169.254), or exfiltrate data.",
    fix_hint:
      "Validate and whitelist allowed URL schemes and domains. Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.x). Use a URL parser to verify before fetching.",
  },
  {
    id: "SEC-010",
    title: "Sensitive Data Exposure in Logs",
    severity: "MEDIUM",
    pattern:
      /console\.(?:log|info|debug|warn|error)\s*\([^)]*(?:password|secret|token|apiKey|api_key|credit.?card|ssn|authorization)\b/gi,
    cwe: "CWE-532",
    owasp: "A09:2021 – Security Logging and Monitoring Failures",
    description:
      "Sensitive data (passwords, tokens, keys) written to application logs. Log files are often accessible to support teams or leaked through log aggregation services.",
    fix_hint:
      "Remove sensitive data from log statements. Use structured logging with redaction: logger.info('Auth attempt', { user: email, password: '[REDACTED]' });",
  },

  // ── LOW ────────────────────────────────────────────────────
  {
    id: "SEC-011",
    title: "Insecure Cookie Configuration",
    severity: "LOW",
    pattern:
      /(?:cookie|setCookie|set-cookie|res\.cookie)\s*\([^)]*(?:httpOnly\s*:\s*false|secure\s*:\s*false|sameSite\s*:\s*['"`]none['"`])/gi,
    cwe: "CWE-614",
    owasp: "A07:2021 – Identification and Authentication Failures",
    description:
      "Cookie set without secure flags (httpOnly, secure, sameSite). This makes the session vulnerable to XSS theft and CSRF attacks.",
    fix_hint:
      "Set cookies with all security flags: res.cookie('session', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 3600000 });",
  },
  {
    id: "SEC-012",
    title: "Hardcoded JWT Secret",
    severity: "HIGH",
    pattern:
      /jwt\.sign\s*\([^)]*,\s*['"`][A-Za-z0-9_\-/.+]{6,}['"`]/gi,
    cwe: "CWE-321",
    owasp: "A02:2021 – Cryptographic Failures",
    description:
      "JWT signing uses a hardcoded secret string instead of an environment variable. Anyone reading the source code can forge valid authentication tokens.",
    fix_hint:
      "Move the JWT secret to an environment variable: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });",
  },
  {
    id: "SEC-013",
    title: "Open CORS — Wildcard Origin",
    severity: "MEDIUM",
    pattern:
      /cors\s*\(\s*\{[^}]*origin\s*:\s*(?:['"`]\*['"`]|true)\s*/gi,
    cwe: "CWE-942",
    owasp: "A05:2021 – Security Misconfiguration",
    description:
      "CORS configured with wildcard (*) or blanket true origin, allowing any website to make authenticated requests to this API. Combined with credentials, this enables full account takeover from malicious sites.",
    fix_hint:
      "Restrict CORS to specific trusted domains: cors({ origin: ['https://yourdomain.com'], credentials: true });",
  },
];

/**
 * Scan a single file's content against all rules.
 *
 * @param {string} fileContent  — Raw source code content
 * @param {string} filePath     — Relative file path (for reporting)
 * @param {string[]} [severityFilter] — Optional: only report these severities
 * @returns {Array<{
 *   ruleId: string,
 *   title: string,
 *   severity: string,
 *   file: string,
 *   line: number,
 *   column: number,
 *   matchedText: string,
 *   cwe: string,
 *   owasp: string,
 *   description: string,
 *   fix_hint: string
 * }>}
 */
function scanFile(fileContent, filePath, severityFilter = null) {
  const findings = [];
  const lines = fileContent.split("\n");

  for (const rule of rules) {
    // Apply severity filter if provided
    if (severityFilter && !severityFilter.includes(rule.severity)) {
      continue;
    }

    // Reset regex lastIndex for global patterns
    rule.pattern.lastIndex = 0;

    let match;
    while ((match = rule.pattern.exec(fileContent)) !== null) {
      // Calculate line number from character offset
      const beforeMatch = fileContent.substring(0, match.index);
      const lineNumber = beforeMatch.split("\n").length;
      const lastNewline = beforeMatch.lastIndexOf("\n");
      const column = match.index - lastNewline;

      // Get surrounding context (3 lines before and after)
      const contextStart = Math.max(0, lineNumber - 4);
      const contextEnd = Math.min(lines.length - 1, lineNumber + 2);
      const codeContext = lines
        .slice(contextStart, contextEnd + 1)
        .map(
          (line, i) =>
            `${contextStart + i + 1 === lineNumber ? "→" : " "} ${contextStart + i + 1} | ${line}`
        )
        .join("\n");

      findings.push({
        ruleId: rule.id,
        title: rule.title,
        severity: rule.severity,
        file: filePath,
        line: lineNumber,
        column: column,
        matchedText: match[0].trim().substring(0, 120),
        codeContext: codeContext,
        cwe: rule.cwe,
        owasp: rule.owasp,
        description: rule.description,
        fix_hint: rule.fix_hint,
      });

      // Prevent infinite loops on zero-length matches
      if (match[0].length === 0) {
        rule.pattern.lastIndex++;
      }
    }
  }

  // Sort by severity: CRITICAL > HIGH > MEDIUM > LOW
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  findings.sort(
    (a, b) =>
      (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99)
  );

  return findings;
}

/**
 * Get the list of all available rules.
 * @returns {Array} All security rules
 */
function getRules() {
  return rules.map(({ pattern, ...rest }) => rest);
}

module.exports = { scanFile, getRules, rules };
