import os
import glob
import re

files = glob.glob('client/src/**/*.jsx', recursive=True) + glob.glob('client/src/**/*.js', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace the template strings `http://${window.location.hostname}:4000...`
    # We will replace `http://${window.location.hostname}:4000` with `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}`
    
    new_content = content.replace(
        "`http://${window.location.hostname}:4000",
        "`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}"
    )
    
    new_content = new_content.replace(
        "`http://${window.location.hostname}:8000",
        "`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'}"
    )

    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Updated {file}")

