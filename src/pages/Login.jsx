import React, { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // ✅ use login from hook

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/token/",
        { email, password }
      );

      const { access, refresh } = response.data;

      login({ access, refresh }); // ✅ replaces localStorage.setItem
      alert("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Invalid email or password");
      console.error(error);
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

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <a href="https://matchgen-backend-production.up.railway.app/auth/login/google-oauth2/">
          <Button variant="outlined" color="secondary">
            Sign in with Google
          </Button>
        </a>
      </div>
    </Container>
  );
};

export default Login;
