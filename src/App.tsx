import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginBox from "./assets/components/LoginBox";
import Dashboard from "./assets/components/Dashboard";
import StarsBackground from "./assets/components/StarsBackground";
import BasicCalculator from "./assets/components/BasicCalculator"; // Adicione este import
import ScientificCalculator from './assets/components/ScientificCalculator';
import Matrix from './assets/components/Matrix'; 
import QuadraticFormula from './assets/components/QuadraticFormula';

const App: React.FC = () => {
  return (
    <Router>
      <StarsBackground />
      <Routes>
        <Route path="/" element={<LoginBox />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/basic-calculator" element={<BasicCalculator />} /> {/* Adicione esta rota */}
        {/* Rota padrão para qualquer caminho inválido */}
        <Route path="/scientific-calculator" element={<ScientificCalculator />} />
        <Route path="/matrix-calculator" element={<Matrix />} />
        <Route path="/quadraticformula-calculator" element={<QuadraticFormula />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
