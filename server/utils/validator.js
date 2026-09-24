// server/utils/validator.js
// Utility functions to validate and clean user input before scanning

/**
 * Check if the provided URL is a valid, scannable web address.
 * Returns an object with isValid flag and a cleaned URL.
 */
function validateAndCleanUrl(rawUrl) {
  
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required and must be a string.' };
  }

  // Trim whitespace from both ends
  let cleanedUrl = rawUrl.trim();

  // Auto-add https:// if user forgot to add protocol (e.g., "google.com")
  if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
    cleanedUrl = 'https://' + cleanedUrl;
  }

  try {
    // JavaScript's built-in URL parser will throw an error if URL is invalid
    const parsedUrl = new URL(cleanedUrl);

    // Make sure it's actually a web URL (not ftp:// or file:// etc.)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { isValid: false, error: 'Only http and https URLs are allowed.' };
    }

    // Block scanning of localhost or private IPs (security best practice)
    const hostname = parsedUrl.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
      return { isValid: false, error: 'Scanning local/private addresses is not allowed.' };
    }

    // Hostname mein kam se kam ek dot (.) hona chahiye aur valid TLD hona chahiye
    // This regex ensures it ends with a dot and at least two letters (like .com, .org, .in)
    const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(hostname)) {
      return { isValid: false, error: 'Please enter a complete domain with an extension (e.g., example.com)' };
    }

    return { isValid: true, cleanedUrl: cleanedUrl };

  } catch (parseError) {
    // URL constructor threw an error — the URL is definitely invalid
    return { isValid: false, error: 'Invalid URL format. Example: https://example.com' };
  }
}

module.exports = { validateAndCleanUrl };
