import React, { useState } from "react";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  Divider,
  FormLabel,
  FormControl,
  Link,
  Stack,
  MuiCard,
  Paper,
  Grid
} from "@mui/material";
import { styled } from '@mui/material/styles';
import axios from "axios";
import useAuth from "../hooks/useAuth";
import AppTheme from '../themes/AppTheme';
import ColorModeSelect from '../themes/colormodeselect';
import Sitemark from '../components/Sitemarkicon';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../components/CustomIcons';

// Styled components for the sign-in-side template
const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
}));

const ImageBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const FormBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // ✅ use login from hook

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/token/",
        { email, password }
      );

      const { access, refresh } = response.data;
      login({ access, refresh });
      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Invalid email or password";
      setErrors({ submit: errorMessage });
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }} />
      
      <StyledBox>
        {/* Left side - Image/Visual section */}
        <ImageBox>
          <Box sx={{ textAlign: 'center', color: 'white', p: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              Welcome to MatchGen
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Create stunning social media posts for your football club
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Customizable templates</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Professional graphics</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Easy team management</Typography>
              </Box>
            </Box>
          </Box>
        </ImageBox>

        {/* Right side - Form section */}
        <FormBox>
          <FormContainer>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Sitemark />
              <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your credentials to access your account
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleLogin}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <FormControl error={!!errors.email}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                  error={!!errors.email}
                  helperText={errors.email}
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
                  disabled={isSubmitting}
                />
              </FormControl>

              <FormControl error={!!errors.password}>
                <FormLabel htmlFor="password">Password</FormLabel>
                <TextField
                  error={!!errors.password}
                  helperText={errors.password}
                  name="password"
                  placeholder="••••••"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  fullWidth
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="Remember me"
                />
                <Link href="#" variant="body2" sx={{ textDecoration: 'none' }}>
                  Forgot your password?
                </Link>
              </Box>

              {errors.submit && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.submit}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleLogin}
                disabled={isSubmitting}
                sx={{ mt: 2, py: 1.5 }}
                size="large"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                sx={{ py: 1.5 }}
                disabled
              >
                Sign in with Google
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                sx={{ py: 1.5 }}
                disabled
              >
                Sign in with Facebook
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link href="/register" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </FormContainer>
        </FormBox>
      </StyledBox>
    </AppTheme>
  );
};

export default Login;
