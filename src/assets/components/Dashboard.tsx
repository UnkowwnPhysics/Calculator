import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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
      path: "/quadratic-solver"
    },
  ];

  const handleLogout = () => {
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
        ></div>
        {menuOpen && (
          <div className="profile-menu">
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        )}
      </div>

      {/* Welcome */}
      <h1 className="welcome-text">Welcome David!</h1>

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