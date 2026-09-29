#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════
//  SecAudit CLI — Security Vulnerability Scanner for CI/CD
//
//  Usage:
//    npx secaudit scan                          # Scan current directory
//    npx secaudit scan --files "src/**/*.js"    # Scan specific glob
//    npx secaudit scan --format json            # JSON output (for CI)
//    npx secaudit scan --severity HIGH          # Only HIGH+ findings
//    npx secaudit rules                         # List all rules
//
//  Part of the Secura DevSecOps CI/CD Pipeline Integration.
// ═══════════════════════════════════════════════════════════════

const fs = require("fs");
const path = require("path");
const { scanFile, getRules } = require("./rules");

// ── ANSI color codes (works in GitHub Actions and most terminals) ──
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

const SEVERITY_COLORS = {
  CRITICAL: `${colors.bgRed}${colors.white}${colors.bold}`,
  HIGH: `${colors.red}${colors.bold}`,
  MEDIUM: `${colors.yellow}`,
  LOW: `${colors.blue}`,
};

const SEVERITY_ICONS = {
  CRITICAL: "🔴",
  HIGH: "🟠",
  MEDIUM: "🟡",
  LOW: "🔵",
};

// ── CLI Argument Parsing ──────────────────────────────────────
function parseArgs(argv) {
  const args = {
    command: argv[2] || "scan",
    files: ".",
    format: "pretty", // 'pretty' or 'json'
    severity: null, // null = all, or 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    help: false,
  };

  for (let i = 3; i < argv.length; i++) {
    switch (argv[i]) {
      case "--files":
      case "-f":
        args.files = argv[++i];
        break;
      case "--format":
      case "-o":
        args.format = argv[++i];
        break;
      case "--severity":
      case "-s":
        args.severity = argv[++i];
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
    }
  }

  return args;
}

// ── File Discovery ────────────────────────────────────────────
const SCANNABLE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".php",
  ".rb",
  ".java",
  ".go",
  ".env",
  ".yml",
  ".yaml",
  ".json",
  ".toml",
  ".cfg",
  ".conf",
  ".ini",
];

const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
  "__pycache__",
  ".venv",
  "vendor",
  "chroma_db",
];

/**
 * Recursively discover files to scan.
 */
function discoverFiles(dir, basePath = dir) {
  let files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.includes(entry.name)) {
          files = files.concat(discoverFiles(fullPath, basePath));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SCANNABLE_EXTENSIONS.includes(ext)) {
          files.push({ fullPath, relativePath });
        }
      }
    }
  } catch (err) {
    // Silently skip unreadable directories
  }

  return files;
}

/**
 * Discover files from a specific list (for CI — only scan changed files).
 */
function discoverSpecificFiles(fileList, basePath = ".") {
  return fileList
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return SCANNABLE_EXTENSIONS.includes(ext) && fs.existsSync(f);
    })
    .map((f) => ({
      fullPath: path.resolve(f),
      relativePath: path.relative(basePath, f),
    }));
}

// ── Pretty Output Formatter ──────────────────────────────────
function printBanner() {
  console.log(`
${colors.cyan}${colors.bold}╔══════════════════════════════════════════════════════╗
║           🛡️  SecAudit — Security Scanner            ║
║         Secura DevSecOps CI/CD Integration           ║
╚══════════════════════════════════════════════════════╝${colors.reset}
`);
}

function printFinding(finding, index) {
  const sevColor = SEVERITY_COLORS[finding.severity] || "";
  const icon = SEVERITY_ICONS[finding.severity] || "⚪";

  console.log(
    `${colors.dim}──────────────────────────────────────────────${colors.reset}`
  );
  console.log(
    `${icon} ${sevColor} ${finding.severity} ${colors.reset} ${colors.bold}${finding.title}${colors.reset} ${colors.dim}[${finding.ruleId}]${colors.reset}`
  );
  console.log(
    `  ${colors.dim}File:${colors.reset} ${colors.cyan}${finding.file}${colors.reset}:${colors.yellow}${finding.line}${colors.reset}:${finding.column}`
  );
  console.log(`  ${colors.dim}CWE:${colors.reset}  ${finding.cwe}`);
  console.log(`  ${colors.dim}OWASP:${colors.reset} ${finding.owasp}`);
  console.log(`  ${finding.description}`);

  if (finding.codeContext) {
    console.log(`\n${colors.dim}  Code:${colors.reset}`);
    finding.codeContext.split("\n").forEach((line) => {
      if (line.startsWith("→")) {
        console.log(
          `  ${colors.red}${colors.bold}${line}${colors.reset}`
        );
      } else {
        console.log(`  ${colors.dim}${line}${colors.reset}`);
      }
    });
  }

  console.log(
    `\n  ${colors.green}💡 Fix:${colors.reset} ${finding.fix_hint}`
  );
}

function printSummary(allFindings) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  allFindings.forEach((f) => counts[f.severity]++);

  console.log(`
${colors.bold}═══════════════════════════════════════════════════════${colors.reset}
${colors.bold}                    SCAN SUMMARY                       ${colors.reset}
${colors.bold}═══════════════════════════════════════════════════════${colors.reset}

  ${SEVERITY_ICONS.CRITICAL} CRITICAL: ${colors.bold}${counts.CRITICAL}${colors.reset}
  ${SEVERITY_ICONS.HIGH} HIGH:     ${colors.bold}${counts.HIGH}${colors.reset}
  ${SEVERITY_ICONS.MEDIUM} MEDIUM:   ${colors.bold}${counts.MEDIUM}${colors.reset}
  ${SEVERITY_ICONS.LOW} LOW:      ${colors.bold}${counts.LOW}${colors.reset}

  Total: ${colors.bold}${allFindings.length}${colors.reset} vulnerabilities found
`);

  if (counts.CRITICAL > 0 || counts.HIGH > 0) {
    console.log(
      `${colors.bgRed}${colors.white}${colors.bold}  ✖ SECURITY CHECK FAILED — ${counts.CRITICAL} critical and ${counts.HIGH} high severity issues must be fixed before merge  ${colors.reset}\n`
    );
  } else if (allFindings.length > 0) {
    console.log(
      `${colors.yellow}  ⚠ WARNINGS FOUND — Consider fixing ${allFindings.length} issues for better security posture${colors.reset}\n`
    );
  } else {
    console.log(
      `${colors.green}${colors.bold}  ✔ ALL CLEAR — No security vulnerabilities detected!${colors.reset}\n`
    );
  }
}

// ── Rules List Command ────────────────────────────────────────
function printRules() {
  printBanner();
  const allRules = getRules();

  console.log(
    `${colors.bold}  Available Security Rules (${allRules.length})${colors.reset}\n`
  );

  for (const rule of allRules) {
    const sevColor = SEVERITY_COLORS[rule.severity] || "";
    const icon = SEVERITY_ICONS[rule.severity] || "⚪";
    console.log(
      `  ${icon} ${sevColor}${rule.severity.padEnd(9)}${colors.reset} ${colors.bold}${rule.id}${colors.reset} — ${rule.title}`
    );
    console.log(
      `    ${colors.dim}${rule.cwe} | ${rule.owasp}${colors.reset}`
    );
    console.log(`    ${colors.dim}${rule.description}${colors.reset}\n`);
  }
}

// ── Help Command ──────────────────────────────────────────────
function printHelp() {
  printBanner();
  console.log(`${colors.bold}Usage:${colors.reset}
  secaudit scan [options]    Scan files for security vulnerabilities
  secaudit rules             List all available security rules
  secaudit help              Show this help message

${colors.bold}Options:${colors.reset}
  --files, -f <glob>         Files or directory to scan (default: ".")
  --format, -o <format>      Output format: 'pretty' or 'json' (default: pretty)
  --severity, -s <level>     Minimum severity: CRITICAL, HIGH, MEDIUM, LOW
  --help, -h                 Show help

${colors.bold}Examples:${colors.reset}
  ${colors.dim}# Scan the current directory${colors.reset}
  secaudit scan

  ${colors.dim}# Scan specific files${colors.reset}
  secaudit scan --files src/

  ${colors.dim}# JSON output for CI/CD integration${colors.reset}
  secaudit scan --format json

  ${colors.dim}# Only report HIGH and CRITICAL issues${colors.reset}
  secaudit scan --severity HIGH

${colors.bold}Exit Codes:${colors.reset}
  0  No HIGH or CRITICAL vulnerabilities found
  1  HIGH or CRITICAL vulnerabilities found (blocks PR)
`);
}

// ── Main Entry Point ──────────────────────────────────────────
function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  switch (args.command) {
    case "rules":
      printRules();
      process.exit(0);
      break;

    case "help":
      printHelp();
      process.exit(0);
      break;

    case "scan":
      break;

    default:
      console.error(`Unknown command: ${args.command}`);
      printHelp();
      process.exit(1);
  }

  // ── Determine severity filter ──
  const severityLevels = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  let severityFilter = null;

  if (args.severity) {
    const idx = severityLevels.indexOf(args.severity.toUpperCase());
    if (idx === -1) {
      console.error(`Invalid severity: ${args.severity}`);
      process.exit(1);
    }
    severityFilter = severityLevels.slice(0, idx + 1);
  }

  // ── Discover files ──
  let files;
  const filesInput = args.files;

  // Check if it's a comma-separated list of specific files (from CI)
  if (filesInput.includes(",")) {
    const fileList = filesInput.split(",").map((f) => f.trim());
    files = discoverSpecificFiles(fileList);
  } else if (
    fs.existsSync(filesInput) &&
    fs.statSync(filesInput).isDirectory()
  ) {
    files = discoverFiles(path.resolve(filesInput));
  } else if (fs.existsSync(filesInput)) {
    files = [
      {
        fullPath: path.resolve(filesInput),
        relativePath: filesInput,
      },
    ];
  } else {
    // Try as a directory from CWD
    const resolved = path.resolve(process.cwd(), filesInput);
    if (fs.existsSync(resolved)) {
      files = discoverFiles(resolved);
    } else {
      console.error(`Path not found: ${filesInput}`);
      process.exit(1);
    }
  }

  if (args.format === "pretty") {
    printBanner();
    console.log(
      `  ${colors.dim}Scanning ${files.length} files...${colors.reset}\n`
    );
  }

  // ── Scan all files ──
  const allFindings = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.fullPath, "utf-8");
      const findings = scanFile(content, file.relativePath, severityFilter);

      if (findings.length > 0) {
        allFindings.push(...findings);

        if (args.format === "pretty") {
          console.log(
            `\n${colors.magenta}${colors.bold}📁 ${file.relativePath}${colors.reset} — ${findings.length} issue(s)`
          );
          findings.forEach((f, i) => printFinding(f, i));
        }
      }
    } catch (err) {
      if (args.format === "pretty") {
        console.log(
          `  ${colors.dim}⏭️  Skipping ${file.relativePath}: ${err.message}${colors.reset}`
        );
      }
    }
  }

  // ── Output ──
  if (args.format === "json") {
    // JSON output for CI/CD consumption (GitHub Action reads this)
    const output = {
      scanner: "secaudit",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      filesScanned: files.length,
      totalFindings: allFindings.length,
      summary: {
        critical: allFindings.filter((f) => f.severity === "CRITICAL").length,
        high: allFindings.filter((f) => f.severity === "HIGH").length,
        medium: allFindings.filter((f) => f.severity === "MEDIUM").length,
        low: allFindings.filter((f) => f.severity === "LOW").length,
      },
      findings: allFindings.map(({ codeContext, ...rest }) => rest),
      blocked:
        allFindings.some(
          (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
        ),
    };
    console.log(JSON.stringify(output, null, 2));
  } else {
    printSummary(allFindings);
  }

  // ── Exit code: 1 if CRITICAL or HIGH findings exist ──
  const hasCriticalOrHigh = allFindings.some(
    (f) => f.severity === "CRITICAL" || f.severity === "HIGH"
  );

  process.exit(hasCriticalOrHigh ? 1 : 0);
}

// ── Run ──
main();
