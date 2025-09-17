import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginBox.css";

const LoginBox: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch("https://calculator-b9q5.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setError("");
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p>{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginBox;
