import React, { useState } from "react";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from '../components/forgotpassword';
import AppTheme from '../themes/AppTheme';
import ColorModeSelect from '../themes/colormodeselect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../components/CustomIcons';

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
    <AppTheme>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        <Card variant="outlined">
          <SitemarkIcon />
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
      </Card>
      </SignInContainer>
    </AppTheme>
  );
};

export default Login;
