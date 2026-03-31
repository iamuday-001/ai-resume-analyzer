import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://ai-resume-analyzer-hib8.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();
      console.log("Login response:", data);

      if (response.status === 200) {
        const userName =
          data.name || data.username || data.full_name || email.split("@")[0];

        // Store new user data
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: userName,
            email: email,
          }),
        );

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <button className="back-button" onClick={() => navigate("/")}>
        ←
      </button>
      <div className="login-card">
        {/* Left side - Image */}
        <div className="login-image">
          <img
            src="https://illustrations.popsy.co/gray/creative-work.svg"
            alt="Login illustration"
          />
          <h3>Welcome Back!</h3>
          <p>Continue your placement journey</p>
        </div>

        {/* Right side - Form */}
        <div className="login-form">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Login</button>
          </form>

          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
