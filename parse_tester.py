import json
import re

# Mock bad JSON from AI
bad_json_1 = r'{"code": "regex: \d+"}'
bad_json_2 = r'{"code": "regex: \'"}'
bad_json_3 = r'{"code": "regex: \.env"}'

def fix_and_parse(text):
    text = re.sub(r'\\(?![\\"/bfnrtu])', r'\\\\', text)
    try:
        return json.loads(text)
    except Exception as e:
        return str(e)

print(fix_and_parse(bad_json_1))
print(fix_and_parse(bad_json_2))
print(fix_and_parse(bad_json_3))
