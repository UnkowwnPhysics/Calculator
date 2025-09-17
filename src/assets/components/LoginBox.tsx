import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginBox.css";

const LoginBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://calculator-b9q5.onrender.com/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      setLoading(false);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Welcome</h1>
          <p>Sign in to access your calculators</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button className="social-button google">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M16.5 9.20455C16.5 8.56636 16.4455 7.95273 16.3409 7.36364H9V10.845H13.2955C13.1159 11.97 12.4773 12.9232 11.5091 13.5568V15.5636H14.1136C15.6227 14.1682 16.5 11.9318 16.5 9.20455Z" fill="#4285F4"/>
              <path d="M9 17C11.2955 17 13.2409 16.2409 14.6136 14.8636L12.0091 12.8568C11.2409 13.3977 10.2273 13.7386 9 13.7386C6.79545 13.7386 4.95 12.3295 4.25455 10.3545H1.56364V12.4091C2.96818 15.2045 5.77273 17 9 17Z" fill="#34A853"/>
              <path d="M4.25455 10.3545C4.05 9.75909 3.93182 9.12273 3.93182 8.5C3.93182 7.87727 4.05 7.24091 4.25455 6.64545V4.59091H1.56364C0.918182 5.86364 0.5 7.32727 0.5 8.5C0.5 9.67273 0.918182 11.1364 1.56364 12.4091L4.25455 10.3545Z" fill="#FBBC05"/>
              <path d="M9 3.26136C10.3318 3.26136 11.5136 3.74545 12.4273 4.66818L14.6682 2.42727C13.2364 1.07727 11.2955 0.5 9 0.5C5.77273 0.5 2.96818 2.29545 1.56364 5.09091L4.25455 7.14545C4.95 5.17045 6.79545 3.26136 9 3.26136Z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="social-button microsoft">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M0 0H8V8H0V0Z" fill="#F1511B"/>
              <path d="M10 0H18V8H10V0Z" fill="#80CC28"/>
              <path d="M0 10H8V18H0V10Z" fill="#00ADEF"/>
              <path d="M10 10H18V18H10V10Z" fill="#FBBC09"/>
            </svg>
            Microsoft
          </button>
        </div>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="#">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default LoginBox;
