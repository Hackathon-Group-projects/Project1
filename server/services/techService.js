// server/services/techService.js
// Custom tech fingerprinter — detects technologies AND their real version numbers
// from the website's HTML body and HTTP response headers.

const fetch = require('node-fetch');

// Each technology has:
//   pattern     → regex to confirm this tech EXISTS on the page
//   versionPattern → regex to extract the ACTUAL version number from HTML
//   category    → what type of technology it is
const TECH_FINGERPRINT_PATTERNS = {
  // Databases (Usually exposed in error pages or specific meta tags)
  'MongoDB': {
    pattern: /mongoose|mongodb/i,
    versionPattern: null,
    category: 'Database'
  },
  // JavaScript Frameworks
  'React': {
    pattern: /react(?:\.min)?\.js|__REACT_DEVTOOLS|react-dom/i,
    // Looks for patterns like: react@18.2.0 or react/18.2.0 or v="18.2.0" near react
    versionPattern: /react[@\/](\d+\.\d+[\.\d]*)/i,
    category: 'JavaScript Framework'
  },
  'Vue.js': {
    pattern: /vue(?:\.min)?\.js|Vue\.config|__vue__/i,
    versionPattern: /vue[@\/](\d+\.\d+[\.\d]*)/i,
    category: 'JavaScript Framework'
  },
  'Angular': {
    pattern: /angular(?:\.min)?\.js|ng-version|ng-app/i,
    // Angular puts version in the ng-version attribute: ng-version="15.0.0"
    versionPattern: /ng-version="(\d+\.\d+[\.\d]*)"/i,
    category: 'JavaScript Framework'
  },
  'Next.js': {
    pattern: /__NEXT_DATA__|next\/static|_next\/static/i,
    versionPattern: /next[@\/](\d+\.\d+[\.\d]*)/i,
    category: 'JavaScript Framework'
  },
  'jQuery': {
    pattern: /jquery(?:\.min)?\.js|jQuery\s*\(/i,
    // jQuery puts version in its URL: jquery-3.6.0.min.js
    versionPattern: /jquery[.-](\d+\.\d+[\.\d]*)/i,
    category: 'JavaScript Library'
  },

  // CMS Platforms
  'WordPress': {
    pattern: /wp-content|wp-includes|wordpress/i,
    // WordPress version appears in meta tags: <meta name="generator" content="WordPress 6.3.1" />
    versionPattern: /WordPress\s+([\d.]+)/i,
    category: 'CMS'
  },
  'Drupal': {
    pattern: /drupal\.js|Drupal\.settings|sites\/default\/files/i,
    versionPattern: /Drupal\s+([\d.]+)/i,
    category: 'CMS'
  },
  'Joomla': {
    pattern: /joomla|\/components\/com_/i,
    versionPattern: /Joomla!\s*([\d.]+)/i,
    category: 'CMS'
  },
  'Shopify': {
    pattern: /cdn\.shopify\.com|Shopify\.theme/i,
    versionPattern: null, // Shopify doesn't expose version in HTML
    category: 'E-commerce'
  },
  'Wix': {
    pattern: /static\.wix\.com|wixstatic\.com/i,
    versionPattern: null,
    category: 'Website Builder'
  },

  // Analytics
  'Google Analytics': {
    pattern: /google-analytics\.com\/analytics\.js|gtag\(|UA-\d+-\d+/i,
    versionPattern: null,
    category: 'Analytics'
  },
  'Hotjar': {
    pattern: /hotjar\.com\/c\/hotjar/i,
    versionPattern: null,
    category: 'Analytics'
  },

  // CSS Frameworks
  'Bootstrap': {
    pattern: /bootstrap(?:\.min)?\.css|bootstrap(?:\.min)?\.js/i,
    // Bootstrap version in URL: bootstrap-5.3.0.min.css
    versionPattern: /bootstrap[@\/-](\d+\.\d+[\.\d]*)/i,
    category: 'CSS Framework'
  },
  'Tailwind CSS': {
    pattern: /tailwindcss|tailwind\.config/i,
    versionPattern: /tailwindcss[@\/](\d+\.\d+[\.\d]*)/i,
    category: 'CSS Framework'
  },
};

// Server-side technologies detected from HTTP response headers
// The version is usually included directly in the header value (e.g., "nginx/1.18.0")
const HEADER_FINGERPRINT_PATTERNS = {
   // Modern Backend Detection
  'Express.js': { header: 'x-powered-by', pattern: /express/i, versionPattern: null, category: 'Web Framework' },
  'Node.js':    { header: 'server',       pattern: /node/i,    versionPattern: /node\/([\d.]+)/i, category: 'Runtime' },
  'Nginx':   { header: 'server',       pattern: /nginx/i,    versionPattern: /nginx\/([\d.]+)/i,   category: 'Web Server' },
  'Apache':  { header: 'server',       pattern: /apache/i,   versionPattern: /Apache\/([\d.]+)/i,  category: 'Web Server' },
  'Cloudflare': { header: 'server',    pattern: /cloudflare/i, versionPattern: null,               category: 'CDN' },
  'PHP':     { header: 'x-powered-by', pattern: /php/i,      versionPattern: /PHP\/([\d.]+)/i,     category: 'Programming Language' },
  'Express': { header: 'x-powered-by', pattern: /express/i,  versionPattern: null,                 category: 'Web Framework' },
  'ASP.NET': { header: 'x-powered-by', pattern: /asp\.net/i, versionPattern: /ASP\.NET\/([\d.]+)/i, category: 'Web Framework' },
};

/**
 * Try to extract a real version number from a text string using a regex.
 * Returns null if no version found — null means "we couldn't detect it".
 * @param {string} text - The HTML body or header value to search in
 * @param {RegExp|null} versionPattern - The regex to find the version number
 */
function extractVersionNumber(text, versionPattern) {
  if (!versionPattern) return null; // This tech doesn't have a version pattern
  const regexMatch = text.match(versionPattern);
  return regexMatch ? regexMatch[1] : null; // Return the captured group (the version digits)
}

/**
 * Scan a website and detect what technologies it uses, including real version numbers.
 * @param {string} websiteUrl - The URL to scan
 * @returns {Promise<Array>} - List of detected techs with name, version, categories
 */
async function checkTechStack(websiteUrl) {
  try {
    // Fetch the full HTML page so we can search through it
    const websiteResponse = await fetch(websiteUrl, {
      method: 'GET',
      redirect: 'follow',
      timeout: 8000,
      headers: {
        // Act like a real browser so the server doesn't block us
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Read the raw HTML body as a string
    const htmlBody = await websiteResponse.text();

    // Read the HTTP response headers
    const responseHeaders = Object.fromEntries(websiteResponse.headers.entries());

    // This array will hold everything we find
    const detectedTechnologies = [];

    // --- Pass 1: Search the HTML body for technology patterns ---
    for (const [techName, techInfo] of Object.entries(TECH_FINGERPRINT_PATTERNS)) {

      // Check if this technology is present in the HTML at all
      if (techInfo.pattern.test(htmlBody)) {

        // Try to extract the actual version number from the HTML
        const extractedVersion = extractVersionNumber(htmlBody, techInfo.versionPattern);

        detectedTechnologies.push({
          name: techName,
          // Use real version if found, otherwise null (not "Detected" — null is more honest)
          version: extractedVersion,
          categories: [techInfo.category]
        });
      }
    }

    // --- Pass 2: Search HTTP headers for server-side technology patterns ---
    for (const [techName, techInfo] of Object.entries(HEADER_FINGERPRINT_PATTERNS)) {

      // Get the value of the specific header we care about (e.g., "server" or "x-powered-by")
      const headerValue = responseHeaders[techInfo.header] || '';

      if (techInfo.pattern.test(headerValue)) {

        // Try to extract version from the header value (e.g., "nginx/1.18.0" → "1.18.0")
        const extractedVersion = extractVersionNumber(headerValue, techInfo.versionPattern);

        detectedTechnologies.push({
          name: techName,
          version: extractedVersion,
          categories: [techInfo.category]
        });
      }
    }

    return detectedTechnologies;

  } catch (scanError) {
    console.error('Tech fingerprinting failed for', websiteUrl, ':', scanError.message);
    return [];
  }
}

module.exports = { checkTechStack };