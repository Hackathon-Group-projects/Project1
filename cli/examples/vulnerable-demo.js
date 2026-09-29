/**
 * ═══════════════════════════════════════════════════════════════
 *  VULNERABLE DEMO FILE — For SecAudit Scanner Testing
 * 
 *  ⚠️  DO NOT USE THIS CODE IN PRODUCTION ⚠️
 *  This file deliberately contains security vulnerabilities
 *  to demonstrate the SecAudit CI/CD scanner's detection
 *  capabilities and AI fix generation.
 * 
 *  Run: npx secaudit scan --files cli/examples/vulnerable-demo.js
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const { exec } = require('child_process');

// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-001: Hardcoded Secret / API Key                      ║
// ╚════════════════════════════════════════════════════════════╝

const api_key = "sk-proj-abc123def456ghi789jkl012mno345pqr678stu";
const secret_key = "super-secret-password-12345";
const database_password = "mongodb+srv://admin:P@ssw0rd@cluster0.mongodb.net";


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-002: SQL Injection via String Concatenation          ║
// ╚════════════════════════════════════════════════════════════╝

function getUserByName(username) {
  // VULNERABLE: String concatenation in SQL query
  const result = db.query("SELECT * FROM users WHERE name = '" + username + "'");
  return result;
}

function deleteUser(userId) {
  // VULNERABLE: Template literal in raw SQL
  db.execute("DELETE FROM users WHERE id = '" + userId + "'");
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-003: Cross-Site Scripting (XSS)                      ║
// ╚════════════════════════════════════════════════════════════╝

function displayUserComment(comment) {
  // VULNERABLE: Directly setting innerHTML with user input
  document.getElementById('comments').innerHTML = comment;
}

function renderProfile(userData) {
  // VULNERABLE: document.write with user data
  document.write('<div>' + userData.bio + '</div>');
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-004: Code Injection via eval()                       ║
// ╚════════════════════════════════════════════════════════════╝

function calculateExpression(userInput) {
  // VULNERABLE: eval with user-controlled input
  const result = eval(userInput);
  return result;
}

function createDynamicFunction(code) {
  // VULNERABLE: new Function with dynamic input
  const fn = new Function('data', code + ' return data;');
  return fn;
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-005: Command Injection via child_process             ║
// ╚════════════════════════════════════════════════════════════╝

function runUserCommand(userInput) {
  // VULNERABLE: exec with string concatenation
  exec('ls -la ' + userInput, (err, stdout) => {
    console.log(stdout);
  });
}

function pingHost(hostname) {
  // VULNERABLE: template literal in exec
  exec(`ping -c 4 ${hostname}`, (err, stdout) => {
    console.log(stdout);
  });
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-007: Insecure Cryptographic Algorithm                ║
// ╚════════════════════════════════════════════════════════════╝

function hashPassword(password) {
  // VULNERABLE: MD5 is cryptographically broken
  const hash = crypto.createHash('md5').update(password).digest('hex');
  return hash;
}

function verifyIntegrity(data) {
  // VULNERABLE: SHA1 has known collision attacks
  return crypto.createHash('sha1').update(data).digest('hex');
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-008: Path Traversal                                  ║
// ╚════════════════════════════════════════════════════════════╝

function downloadFile(req, res) {
  // VULNERABLE: User input directly used in file path
  const content = fs.readFileSync(req.query.filePath, 'utf-8');
  res.send(content);
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-009: Server-Side Request Forgery (SSRF)              ║
// ╚════════════════════════════════════════════════════════════╝

async function proxyRequest(req, res) {
  // VULNERABLE: Fetching user-controlled URL without validation
  const response = await fetch(req.query.url);
  const data = await response.text();
  res.send(data);
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-010: Sensitive Data Exposure in Logs                 ║
// ╚════════════════════════════════════════════════════════════╝

function loginUser(email, password) {
  console.log('Login attempt with password:', password, 'for user:', email);
  // ... authentication logic
}

function processPayment(card, token) {
  console.log('Processing payment with token:', token);
  // ... payment logic
}


// ╔════════════════════════════════════════════════════════════╗
// ║  SEC-012: Hardcoded JWT Secret                            ║
// ╚════════════════════════════════════════════════════════════╝

const jwt = require('jsonwebtoken');

function generateToken(user) {
  // VULNERABLE: Hardcoded JWT signing secret
  return jwt.sign({ id: user.id, role: user.role }, 'my-super-secret-jwt-key-2024', {
    expiresIn: '24h'
  });
}


// Export for testing
module.exports = {
  getUserByName,
  deleteUser,
  displayUserComment,
  renderProfile,
  calculateExpression,
  createDynamicFunction,
  runUserCommand,
  pingHost,
  hashPassword,
  verifyIntegrity,
  downloadFile,
  proxyRequest,
  loginUser,
  processPayment,
  generateToken
};
