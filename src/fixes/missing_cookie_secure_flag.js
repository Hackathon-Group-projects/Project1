Session cookies lack the Secure and HttpOnly flags, permitting transmission over unencrypted HTTP and exposing session tokens to XSS vectors.

**Impact**: Permits interception of active session tokens over Wi-Fi / MITM networks.

**Recommended Fix**:
Configure Set-Cookie with "Secure; HttpOnly; SameSite=Strict" in web server headers.