import React, { useState, useEffect } from "react";
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
  Card,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
  // background: 'linear-gradient(135deg,rgb(6, 22, 94) 0%, #764ba2 100%)',
  background: 'rgb(211, 211, 211) 0%',
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
  const { auth, login, logout } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (auth.token) {
      navigate('/dashboard');
    }
  }, [auth.token, navigate]);

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

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage("Please enter a valid email address");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage("");

    try {
      await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/forgot-password/",
        { email: forgotPasswordEmail }
      );
      
      setForgotPasswordMessage("Password reset instructions have been sent to your email address.");
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Failed to send reset instructions. Please try again.";
      setForgotPasswordMessage(errorMessage);
      console.error("Forgot password error:", error);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      {/* ColorModeSelect hidden - defaulting to light mode */}
      {/* <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }} /> */}
      {auth.token && (
        <Button
          variant="outlined"
          onClick={logout}
          sx={{ 
            position: 'fixed', 
            top: '1rem', 
            left: '1rem', 
            zIndex: 1000,
            color: 'white',
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          Logout
        </Button>
      )}
      
      <StyledBox>
        {/* Left side - Image/Visual section */}
        <ImageBox>
          <Box sx={{ textAlign: 'center', color: 'hsl(220, 30%, 6%)', p: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              Welcome to MatchGen
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Matchday's Made Easier! Power up your club’s social media in minutes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Ready-made templates tailored for your club</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Professional-quality designs, no designer needed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Save hours on team and matchday posts</Typography>
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
                <Link 
                  component="button" 
                  variant="body2" 
                  sx={{ textDecoration: 'none' }}
                  onClick={() => setForgotPasswordOpen(true)}
                >
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

            {/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            </Box> */}

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

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => {
          setForgotPasswordOpen(false);
          setForgotPasswordEmail("");
          setForgotPasswordMessage("");
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Reset Password</DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Typography variant="body1" paragraph sx={{ color: 'white', mb: 2 }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
          
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            margin="normal"
            placeholder="your@email.com"
            sx={{
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#2196f3' }
              },
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />

          {forgotPasswordMessage && (
            <Alert 
              severity={forgotPasswordMessage.includes("sent") ? "success" : "error"} 
              sx={{ mt: 2 }}
            >
              {forgotPasswordMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setForgotPasswordOpen(false);
              setForgotPasswordEmail("");
              setForgotPasswordMessage("");
            }}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleForgotPassword}
            disabled={forgotPasswordLoading}
            startIcon={forgotPasswordLoading ? <CircularProgress size={20} /> : null}
          >
            {forgotPasswordLoading ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
};

export default Login;
