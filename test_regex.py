import re
import json

text = '{"desc": "Line1\\nLine2", "regex": "^\\d+$", "path": "C:\\Windows"}'

# This regex finds a backslash that is NOT followed by a valid JSON escape char
fixed_text = re.sub(r'\\(?![\\"/bfnrtu])', r'\\\\', text)

print("Original:", repr(text))
print("Fixed:", repr(fixed_text))

try:
    print(json.loads(fixed_text))
except Exception as e:
    print("Error:", e)
