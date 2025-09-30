import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginBox from "./assets/components/LoginBox";
import Dashboard from "./assets/components/Dashboard";
import StarsBackground from "./assets/components/StarsBackground";
import BasicCalculator from "./assets/components/BasicCalculator";
import ScientificCalculator from './assets/components/ScientificCalculator';
import Matrix from './assets/components/Matrix'; 
import QuadraticFormula from './assets/components/QuadraticFormula';
import Eigen from './assets/components/Eigen';
import GraphicCalculator from './assets/components/GraphicCalculator';

// Verificação de autenticação melhorada
const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    // Verifica se ambos existem e são válidos
    if (!token || token === 'undefined' || token === 'null' || token === '') {
      return false;
    }
    
    if (!user || user === 'undefined' || user === 'null' || user === '') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Componente de loading para evitar flash
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '1.2rem'
  }}>
    <div>Loading...</div>
  </div>
);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que o localStorage foi verificado
    const timer = setTimeout(() => {
      setAuthenticated(isAuthenticated());
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return authenticated ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthenticated(isAuthenticated());
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return !authenticated ? children : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  // Log para debug (remova em produção)
  useEffect(() => {
    console.log('=== AUTH DEBUG ===');
    console.log('Token:', localStorage.getItem('authToken'));
    console.log('User:', localStorage.getItem('user'));
    console.log('Is Authenticated:', isAuthenticated());
    console.log('Current path:', window.location.pathname);
  }, []);

  return (
    <Router>
      <StarsBackground />
      <Routes>
        {/* Rota raiz - sempre acessível */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginBox />
            </PublicRoute>
          } 
        />
        
        {/* Rota para index.html - redireciona para raiz */}
        <Route 
          path="/index.html" 
          element={<Navigate to="/" replace />} 
        />
        
        {/* Rotas protegidas */}
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
        <Route 
          path="/graphic-calculator" 
          element={
            <ProtectedRoute>
              <GraphicCalculator />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota curinga - redireciona para raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
