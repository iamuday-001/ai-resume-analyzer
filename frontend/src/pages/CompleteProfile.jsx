import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CompleteProfile.css";

function CompleteProfile() {
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setError("");
    setSuccess("");

    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only");
        setResume(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        setResume(null);
        return;
      }

      setResume(file);
      setSuccess(`✓ ${file.name} selected`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resume) {
      setError("Please upload your resume");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const response = await fetch("http://127.0.0.1:5000/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📥 Response from server:", data);

      if (response.ok && data.success) {
        // Get current user email
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);

          // Store analysis with user email as key
          const analysisKey = `resumeAnalysis_${user.email}`;
          localStorage.setItem(analysisKey, JSON.stringify(data.analysis));
          console.log(`✅ Analysis saved for user: ${user.email}`);
        }

        setSuccess("✅ Resume analyzed successfully! Redirecting...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Upload failed");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  // AI ANALYZING SCREEN
  if (loading) {
    return (
      <div className="analyzing-container">
        <div className="analyzing-box">
          <div className="spinner"></div>
          <h2>Analyzing Your Resume...</h2>
          <p>Our AI is scanning your skills, experience, and education</p>
          <p className="small-text">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complete-profile-container">
      <div className="profile-card">
        <h2>Complete Your Profile</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label>Upload Resume (PDF only)</label>

            <input type="file" accept=".pdf" onChange={handleFileChange} />

            <div className="file-hint">📄 Max file size: 5MB</div>
          </div>

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">{success}</div>}

          {resume && (
            <div className="file-selected">
              <span>📄 {resume.name}</span>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {resume ? "Analyze My Resume →" : "Select Resume First"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;
