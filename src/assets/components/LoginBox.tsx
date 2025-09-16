import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginBox.css";

const LoginBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se é um email válido
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    // Verifica se é o email e senha corretos
    if (email === "teste@gmail.com" && password === "123") {
      setError("");
      localStorage.setItem("user", JSON.stringify({ name: "Test User", email }));
      navigate("/dashboard");
    } else {
      setError("Incorrect email or password.");
    }
  };

  const handleSignUp = () => {
    alert("Sign Up clicked!");
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked!");
  };

  const handleMicrosoftLogin = () => {
    alert("Microsoft login clicked!");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="welcome-text">Welcome</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          {error && <p className="error-text">{error}</p>}
          <div className="button-group">
            <button type="submit" className="btn login-btn">Login</button>
            <button type="button" className="btn signup-btn" onClick={handleSignUp}>Sign Up</button>
          </div>
        </form>
        <div className="divider"><span>or</span></div>
        <div className="social-buttons">
          <button className="btn social-btn google-btn" onClick={handleGoogleLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
            </svg>
            Google
          </button>
          <button className="btn social-btn microsoft-btn" onClick={handleMicrosoftLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.462 0H0v7.19h7.462V0zM16 0H8.538v7.19H16V0zM7.462 8.211H0V16h7.462V8.211zm8.538 0H8.538V16H16V8.211z"/>
            </svg>
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginBox;
