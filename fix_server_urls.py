import os

# Fix server/server.js
with open('server/server.js', 'r') as f:
    content = f.read()

new_content = content.replace(
    "const allowedOrigins = ['http://localhost:5173', 'http://localhost:4000', 'http://localhost:3000'];",
    "const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:4000', 'http://localhost:3000'];"
)

with open('server/server.js', 'w') as f:
    f.write(new_content)

# Fix server/services/aiService.js
with open('server/services/aiService.js', 'r') as f:
    content2 = f.read()

new_content2 = content2.replace(
    "const PYTHON_SERVICE_URL = 'http://localhost:8000/analyze';",
    "const PYTHON_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';"
)

with open('server/services/aiService.js', 'w') as f:
    f.write(new_content2)

print("Updated server files.")
