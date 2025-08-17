import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return <Navigate to="/login" replace />;
    }
    
    return children;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;