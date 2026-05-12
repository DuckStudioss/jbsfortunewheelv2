import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SpinWheel } from "./components/SpinWheel";
import { AdminDashboard } from "./components/AdminDashboard";
import { WheelTest } from "./components/WheelTest";
import { Navbar } from "./components/Navbar";
import { Login } from "./components/Login";

const About = () => (
  <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
    <h1>Acerca de JB's Burger Wheel</h1>
    <p>¡Una forma divertida de ganar premios increíbles!</p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<SpinWheel />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/test" element={<WheelTest />} />
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
