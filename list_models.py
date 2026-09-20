import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('ai-service/.env')
api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    print("API Key not found!")
    exit(1)

genai.configure(api_key=api_key)

print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
