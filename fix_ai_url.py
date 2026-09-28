import os
with open('server/services/aiService.js', 'r') as f:
    content = f.read()
new_content = content.replace(
    "const PYTHON_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';",
    "const PYTHON_SERVICE_URL = process.env.AI_SERVICE_URL ? `${process.env.AI_SERVICE_URL}/analyze` : 'http://localhost:8000/analyze';"
)
with open('server/services/aiService.js', 'w') as f:
    f.write(new_content)
