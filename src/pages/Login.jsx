import React, { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/login/",
        { email, password }
      );
      localStorage.setItem("token", res.data.access);
      alert("Login successful!");
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <Container>
      <Typography variant="h4">Login</Typography>
      <TextField label="Email" onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleLogin}>Login</Button>
    </Container>
  );
};

export default Login;
