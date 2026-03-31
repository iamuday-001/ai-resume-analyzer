from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import os
import pdfplumber
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re
from datetime import datetime

# -----------------------------
# LOAD ENV VARIABLES
# -----------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")

if not GEMINI_API_KEY:
    raise Exception("❌ GEMINI_API_KEY not found in environment variables")

if not MONGODB_URI:
    raise Exception("❌ MONGODB_URI not found in environment variables")

# -----------------------------
# MONGODB CONNECTION
# -----------------------------
try:
    client = MongoClient(MONGODB_URI)
    # Test connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB Atlas")
    
    db = client.placement_db
    users_collection = db.users
    resumes_collection = db.resumes
    print("✅ MongoDB collections ready")
    
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    raise e

# -----------------------------
# GEMINI SETUP
# -----------------------------
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("models/gemini-2.5-flash") 
print("✅ Gemini Initialized")

# -----------------------------
# FLASK SETUP
# -----------------------------
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "API is running 🚀"})

# -----------------------------
# REGISTER
# -----------------------------
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not all([name, email, password]):
            return jsonify({"message": "All fields are required"}), 400

        # Check if user already exists
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({"message": "Email already exists"}), 400

        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        # Create user document
        user = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.now()
        }

        # Insert into MongoDB
        result = users_collection.insert_one(user)
        print(f"✅ User registered: {email}")

        return jsonify({"message": "User registered successfully!"}), 201

    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({"error": str(e)}), 500

# -----------------------------
# LOGIN
# -----------------------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        user = users_collection.find_one({"email": email})

        if user and bcrypt.check_password_hash(user["password"], password):
            return jsonify({
                "message": "Login successful",
                "name": user["name"],
                "email": user["email"]
            }), 200

        return jsonify({"message": "Invalid credentials"}), 401

    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"error": str(e)}), 500

# -----------------------------
# JSON EXTRACTOR
# -----------------------------
def extract_json_from_text(text):
    try:
        json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        json_match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))

        return json.loads(text)

    except Exception as e:
        print("⚠ JSON parsing failed:", e)
        return {
            "score": 70,
            "skills": ["Communication", "Problem Solving"],
            "resume_summary": "Basic resume detected.",
            "strengths": ["Good communication"],
            "weaknesses": ["Limited technical experience"],
            "job_roles": ["Junior Developer"],
            "skill_gap": ["Learn modern frameworks"],
            "graph_analysis": {
                "technical_skills": 60,
                "communication": 75,
                "projects": 55,
                "experience": 40
            }
        }

# -----------------------------
# RESUME UPLOAD + AI ANALYSIS
# -----------------------------
@app.route("/upload-resume", methods=["POST"])
def upload_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["resume"]
        email = request.form.get("email")
        
        if not email:
            return jsonify({"error": "User email required"}), 400

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        filename = file.filename.replace(" ", "_")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        resume_text = ""

        # Extract text from PDF
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    resume_text += text + "\n"

        if not resume_text.strip():
            os.remove(filepath)
            return jsonify({"error": "Could not read PDF"}), 400

        # AI PROMPT
        prompt = f"""
You are an expert Resume Analyzer and Career Advisor.

Analyze the resume and return ONLY JSON.

Resume Content:
{resume_text[:4000]}

Return JSON in this format:

{{
"score": number between 0-100,
"skills": ["skill1","skill2","skill3"],
"resume_summary": "2-3 line summary",
"strengths": ["strength1","strength2"],
"weaknesses": ["weakness1","weakness2"],
"job_roles": ["role1","role2"],
"skill_gap": ["skill1","skill2"],
"graph_analysis": {{
"technical_skills": number,
"communication": number,
"projects": number,
"experience": number
}}
}}

Return ONLY JSON.
"""

        # Gemini call
        response = model.generate_content(prompt)
        analysis_data = extract_json_from_text(response.text)

        # Save to MongoDB
        resume_doc = {
            "email": email,
            "filename": filename,
            "analysis": analysis_data,
            "uploaded_at": datetime.now()
        }

        resumes_collection.update_one(
            {"email": email},
            {"$set": resume_doc},
            upsert=True
        )

        # Delete file after processing
        if os.path.exists(filepath):
            os.remove(filepath)

        print(f"✅ Resume analyzed for: {email}")

        return jsonify({
            "success": True,
            "analysis": analysis_data
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        import traceback
        traceback.print_exc()

        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({
            "error": "Failed to process resume",
            "details": str(e)
        }), 500

# -----------------------------
# GET USER ANALYSIS
# -----------------------------
@app.route("/get-analysis/<email>", methods=["GET"])
def get_analysis(email):
    try:
        resume = resumes_collection.find_one({"email": email})
        if resume:
            return jsonify({
                "success": True,
                "analysis": resume["analysis"]
            })
        else:
            return jsonify({"success": False, "message": "No resume found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)