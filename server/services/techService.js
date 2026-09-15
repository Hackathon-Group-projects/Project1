// server/services/techService.js
// Custom tech fingerprinter — no external API or broken package needed!
// It fetches the website's HTML + headers and uses patterns to detect technologies.

const fetch = require('node-fetch');

// A dictionary of technologies and the patterns that indicate their presence.
// Each entry checks for a pattern inside the HTML body of the webpage.
const TECH_FINGERPRINT_PATTERNS = {
  // JavaScript Frameworks
  'React':        { pattern: /react(?:\.min)?\.js|__REACT_DEVTOOLS|react-dom/i,         category: 'JavaScript Framework' },
  'Vue.js':       { pattern: /vue(?:\.min)?\.js|Vue\.config|__vue__/i,                  category: 'JavaScript Framework' },
  'Angular':      { pattern: /angular(?:\.min)?\.js|ng-version|ng-app/i,                category: 'JavaScript Framework' },
  'Next.js':      { pattern: /__NEXT_DATA__|next\/static|_next\/static/i,               category: 'JavaScript Framework' },
  'jQuery':       { pattern: /jquery(?:\.min)?\.js|jQuery\s*\(/i,                       category: 'JavaScript Library' },

  // CMS Platforms
  'WordPress':    { pattern: /wp-content|wp-includes|wordpress/i,                       category: 'CMS' },
  'Drupal':       { pattern: /drupal\.js|Drupal\.settings|sites\/default\/files/i,      category: 'CMS' },
  'Joomla':       { pattern: /joomla|\/components\/com_/i,                              category: 'CMS' },
  'Shopify':      { pattern: /cdn\.shopify\.com|Shopify\.theme/i,                       category: 'E-commerce' },
  'Wix':          { pattern: /static\.wix\.com|wixstatic\.com/i,                       category: 'Website Builder' },

  // Analytics & Marketing
  'Google Analytics': { pattern: /google-analytics\.com\/analytics\.js|gtag\(|UA-\d+-\d+/i, category: 'Analytics' },
  'Hotjar':       { pattern: /hotjar\.com\/c\/hotjar/i,                                  category: 'Analytics' },

  // CSS Frameworks
  'Bootstrap':    { pattern: /bootstrap(?:\.min)?\.css|bootstrap(?:\.min)?\.js/i,       category: 'CSS Framework' },
  'Tailwind CSS': { pattern: /tailwindcss|tailwind\.config/i,                           category: 'CSS Framework' },
};

// These technologies are detected from HTTP response headers, not the HTML body.
const HEADER_FINGERPRINT_PATTERNS = {
  'Nginx':        { header: 'server',       pattern: /nginx/i,          category: 'Web Server' },
  'Apache':       { header: 'server',       pattern: /apache/i,         category: 'Web Server' },
  'Cloudflare':   { header: 'server',       pattern: /cloudflare/i,     category: 'CDN' },
  'PHP':          { header: 'x-powered-by', pattern: /php/i,            category: 'Programming Language' },
  'Express':      { header: 'x-powered-by', pattern: /express/i,        category: 'Web Framework' },
  'ASP.NET':      { header: 'x-powered-by', pattern: /asp\.net/i,       category: 'Web Framework' },
};

/**
 * Detect technologies used by a website by analyzing its HTML and headers.
 * This is a free, offline alternative to the Wappalyzer API.
 * @param {string} websiteUrl - The URL to scan
 * @returns {Promise<Array>} - A list of detected technologies
 */
async function checkTechStack(websiteUrl) {
  try {
    // Fetch the full webpage (we need the HTML body this time, so we use GET)
    const websiteResponse = await fetch(websiteUrl, {
      method: 'GET',
      redirect: 'follow',
      timeout: 8000, // Stop waiting after 8 seconds
      headers: {
        // Pretend to be a real browser so websites don't block us
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Get the raw HTML as a string to search through
    const htmlBody = await websiteResponse.text();

    // Get the response headers to detect server-side technologies
    const responseHeaders = Object.fromEntries(websiteResponse.headers.entries());

    // Array to collect every technology we successfully detect
    const detectedTechnologies = [];

    // --- Pass 1: Scan the HTML body for frontend technology patterns ---
    for (const [techName, techInfo] of Object.entries(TECH_FINGERPRINT_PATTERNS)) {
      if (techInfo.pattern.test(htmlBody)) {
        // Technology found in the HTML! Add it to our results.
        detectedTechnologies.push({
          name: techName,
          version: 'Detected',   // We can't easily extract version from raw HTML
          categories: [techInfo.category]
        });
      }
    }

    // --- Pass 2: Scan the HTTP headers for server-side technology patterns ---
    for (const [techName, techInfo] of Object.entries(HEADER_FINGERPRINT_PATTERNS)) {
      const headerValue = responseHeaders[techInfo.header] || '';
      if (techInfo.pattern.test(headerValue)) {
        // Technology found in the headers! Add it to our results.
        detectedTechnologies.push({
          name: techName,
          version: headerValue.trim(), // The header value often contains the version
          categories: [techInfo.category]
        });
      }
    }

    return detectedTechnologies;

  } catch (scanError) {
    // If the website is unreachable or times out, log it and return an empty list
    console.error('Tech fingerprinting failed for', websiteUrl, ':', scanError.message);
    return [];
  }
}

// Export the function so scan.js can import and use it
module.exports = { checkTechStack };