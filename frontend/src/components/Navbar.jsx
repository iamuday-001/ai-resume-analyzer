import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  // Get first letter of name for avatar
  const getInitial = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    // Navigate to login page
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-container">
          <div className="logo-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 2L4 8V16C4 22 8 28 16 30C24 28 28 22 28 16V8L16 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16L15 19L20 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="10" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="project-title-wrapper">
            <h1 className="project-title">
              <span className="title-main">AI Placement</span>
              <span className="title-sub">Guidance System</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>

            <div className="user-avatar-wrapper">
              <div className="user-avatar">{getInitial()}</div>
              <div className="avatar-status"></div>
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <svg
                className="logout-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 17L21 12L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
