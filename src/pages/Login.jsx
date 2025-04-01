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

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  minHeight: "100%",
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

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
      <SignInContainer direction="column">
  <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
  <Card variant="outlined">
    <SitemarkIcon />
    <Typography
      component="h1"
      variant="h4"
      sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
    >
      Sign in
    </Typography>

    <Box
      component="form"
      onSubmit={handleLogin}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
                  <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                // error={emailError}
                // helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
      
      {/* <TextField
        fullWidth
        label="Email"
        variant="outlined"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /> */}
                  <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                // error={passwordError}
                // helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
      {/* <TextField
        fullWidth
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /> */}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={handleLogin}
        sx={{ mt: 2 }}
      >
        Login
      </Button>
    </Box>

    <Divider>or</Divider>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography sx={{ textAlign: 'center' }}>
        Don&apos;t have an account?{' '}
        <Link href="/material-ui/getting-started/templates/sign-in/" variant="body2">
          Sign up
        </Link>
      </Typography>
    </Box>
  </Card>
</SignInContainer>
    </AppTheme>
  );
};

export default Login;
