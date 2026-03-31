import React from "react";
import "./HeroSection.css";

const HeroSection = ({ username, onButtonClick }) => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Welcome back, <span className="username-highlight">{username}</span>!
        </h1>

        <p className="hero-subtitle">
          Your journey to self-discovery starts here. Every day is a new
          opportunity to learn more about yourself.
        </p>

        <button className="hero-button" onClick={onButtonClick}>
          Tell me about yourself
          <span className="button-arrow">→</span>
        </button>
      </div>

      <div className="hero-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </section>
  );
};

export default HeroSection;
