import React from "react";
import { Link } from "react-router-dom";
import "./Intro.css";

function Intro() {
  return (
    <div className="intro-container">
      <div className="intro-left">
        <h1 className="title">
          AI-Based Student Placement <br />
          <span className="title-highlight">Guidance System</span>
        </h1>
        <p className="description">
          The AI-Based Student Placement Guidance System is an intelligent web
          platform that analyzes a student's academic profile and resume using
          Artificial Intelligence and provides personalized placement guidance,
          skill gap analysis, career recommendations, and preparation roadmaps.
        </p>

        <div className="intro-buttons">
          <Link to="/login">
            <button className="btn login-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="btn register-btn">Register</button>
          </Link>
        </div>
      </div>

      <div className="intro-right">
        <img
          src="https://illustrations.popsy.co/gray/student-graduation.svg"
          alt="Student Graduation Illustration"
        />
      </div>
    </div>
  );
}

export default Intro;
