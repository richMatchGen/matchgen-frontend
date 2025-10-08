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
import { env } from "../config/environment";
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
  background: 'rgb(242, 253, 125)',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
    `,
    zIndex: 1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%),
      linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)
    `,
    zIndex: 2,
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
        `${env.API_BASE_URL}/users/token/`,
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
        `${env.API_BASE_URL}/users/forgot-password/`,
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
          <Box sx={{ 
            textAlign: 'center', 
            color: '#1a1a1a', 
            p: 4, 
            position: 'relative',
            zIndex: 3,
            maxWidth: 500,
            mx: 'auto'
          }}>
            {/* Decorative shapes */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              zIndex: -1,
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              zIndex: -1,
            }} />
            
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              background: 'linear-gradient(45deg, #1a1a1a 0%, #4a4a4a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Welcome
            </Typography>
            
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: '#2d2d2d',
              fontWeight: 500,
              lineHeight: 1.4
            }}>
              Matchday's Made Easier! Power up your club's social media in minutes
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3, 
              maxWidth: 400, 
              mx: 'auto',
              mt: 4
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                p: 2,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography variant="body1" sx={{ color: '#2d2d2d', fontWeight: 500 }}>
                  Ready-made templates tailored for your club
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                p: 2,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography variant="body1" sx={{ color: '#2d2d2d', fontWeight: 500 }}>
                  Professional-quality designs, no designer needed
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 3,
                p: 2,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography variant="body1" sx={{ color: '#2d2d2d', fontWeight: 500 }}>
                  Save hours on team and matchday posts
                </Typography>
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLogin(e);
                }
              }}
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
                  variant="body2" 
                  sx={{ 
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPasswordOpen(true);
                  }}
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
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
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
              '& .MuiInputBase-input': { color: 'Black' },
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
