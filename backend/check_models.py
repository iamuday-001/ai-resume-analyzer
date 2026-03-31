import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

print("✅ Available Gemini Models:")
print("-" * 50)

for model in genai.list_models():
    print(f"Model: {model.name}")
    print(f"Supported methods: {model.supported_generation_methods}")
    print("-" * 50)