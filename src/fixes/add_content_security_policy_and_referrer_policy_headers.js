```nginx
add_content_security_policy "default-src 'self';";
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```