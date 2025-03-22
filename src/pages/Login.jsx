import React, { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/login/",
        { email, password }
      );
      
      // Store token in localStorage for authentication
      localStorage.setItem("token", response.data.access);
      alert("Login successful!");
      window.location.href = "/dashboard"; // Redirect after login
    } catch (error) {
      alert("Invalid email or password");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Typography variant="h4" align="center">Login</Typography>
      <TextField 
        fullWidth 
        label="Email" 
        variant="outlined" 
        margin="normal" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <TextField 
        fullWidth 
        label="Password" 
        type="password" 
        variant="outlined" 
        margin="normal" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <Button 
        fullWidth 
        variant="contained" 
        color="primary" 
        onClick={handleLogin}
        style={{ marginTop: "20px" }}
      >
        Login
      </Button>
      <a href="https://matchgen-backend-production.up.railway.app/auth/login/google-oauth2/">
  <button>Sign in with Google</button>
</a>
    </Container>
  );
};

export default Login;
