import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginBox from "./assets/components/LoginBox";
import Dashboard from "./assets/components/Dashboard";
import StarsBackground from "./assets/components/StarsBackground";
import BasicCalculator from "./assets/components/BasicCalculator";
import ScientificCalculator from './assets/components/ScientificCalculator';
import Matrix from './assets/components/Matrix'; 
import QuadraticFormula from './assets/components/QuadraticFormula';
import Eigen from './assets/components/Eigen';

// Adicione uma verificação simples de autenticação
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return token !== null && token !== undefined && token !== '';
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

// Componente para redirecionar usuários autenticados para o dashboard
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <StarsBackground />
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginBox />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/basic-calculator" 
          element={
            <ProtectedRoute>
              <BasicCalculator />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/scientific-calculator" 
          element={
            <ProtectedRoute>
              <ScientificCalculator />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matrix-calculator" 
          element={
            <ProtectedRoute>
              <Matrix />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quadraticformula-calculator" 
          element={
            <ProtectedRoute>
              <QuadraticFormula />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/eigen-calculator" 
          element={
            <ProtectedRoute>
              <Eigen />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
