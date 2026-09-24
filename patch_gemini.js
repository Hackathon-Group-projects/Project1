const fs = require('fs');
const file = 'ai-service/services/gemini_service.py';
let code = fs.readFileSync(file, 'utf8');

// Ensure 'import json_repair' is in the file
if (!code.includes('import json_repair')) {
  code = code.replace('import json', 'import json\nimport json_repair');
}

const oldCode = `            text = text.strip()
            # Fix invalid escapes that AI models often output in code snippets (like \\d or Windows paths)
            # This regex escapes backslashes that are NOT part of a valid JSON escape sequence.
            text = re.sub(r'\\\\(?![\\\\"/bfnrtu])', r'\\\\\\\\', text)

            parsed = json.loads(text)`;

const newCode = `            text = text.strip()
            # Use json_repair for robust LLM JSON parsing
            parsed = json_repair.loads(text)`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync(file, code);
  console.log('Patched gemini_service.py successfully.');
} else {
  console.log('Could not find old code block.');
}
