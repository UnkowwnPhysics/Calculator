import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Obter nome do usuário do localStorage
  const userData = localStorage.getItem("user");
  const userName = userData ? JSON.parse(userData).name || "User" : "User";

  const features = [
    { 
      title: "Basic Calculator", 
      color: "rgba(76, 175, 80, 0.8)",
      path: "/basic-calculator"
    },
    { 
      title: "Scientific Calculator", 
      color: "rgba(33, 150, 243, 0.8)",
      path: "/scientific-calculator"
    },
    { 
      title: "Matrix Calculator", 
      color: "rgba(255, 152, 0, 0.8)",
      path: "/matrix-calculator"
    },
    { 
      title: "Eigenvalues & Eigenvectors", 
      color: "rgba(156, 39, 176, 0.8)",
      path: "/eigen-calculator"
    },
    { 
      title: "Quadratic Formula Solver", 
      color: "rgba(233, 30, 99, 0.8)",
      path: "/quadraticformula-calculator"  // Corrigido para corresponder à rota definida
    },
    { 
      title: "Graphing Calculator", 
      color: "rgba(120, 83, 154, 0.8)",
      path: "/graphing-calculator"
    },
  ];

  const handleLogout = () => {
    // Remover ambos os itens de autenticação
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      {/* Perfil no canto superior direito */}
      <div className="profile-container">
        <div
          className="profile-circle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        {menuOpen && (
          <div className="profile-menu">
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Welcome */}
      <h1 className="welcome-text">Welcome {userName}!</h1>

      {/* Grid de features */}
      <div className="dashboard-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-box"
            style={{ backgroundColor: feature.color }}
            onClick={() => handleFeatureClick(feature.path)}
          >
            {feature.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
