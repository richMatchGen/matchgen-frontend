import React, { useState, useEffect } from "react";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box,
  CssBaseline,
  Alert,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from "axios";
import AppTheme from '../themes/AppTheme';
import Sitemark from '../components/Sitemarkicon';

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

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!token) {
      newErrors.token = "Invalid reset link";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage("");
    
    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/reset-password/",
        { 
          token: token,
          new_password: newPassword 
        }
      );

      setMessage("Password has been reset successfully! You can now log in with your new password.");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to reset password. Please try again.";
      setErrors({ submit: errorMessage });
      console.error("Reset password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      
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
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              background: 'linear-gradient(45deg, #1a1a1a 0%, #4a4a4a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Reset Your Password
            </Typography>
            
            <Typography variant="h5" sx={{ 
              mb: 4, 
              color: '#2d2d2d',
              fontWeight: 500,
              lineHeight: 1.4
            }}>
              Enter your new password to regain access to your MatchGen account
            </Typography>
          </Box>
        </ImageBox>

        {/* Right side - Form section */}
        <FormBox>
          <FormContainer>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Sitemark />
              <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter your new password below
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleResetPassword}
              noValidate
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <TextField
                error={!!errors.newPassword}
                helperText={errors.newPassword}
                label="New Password"
                type="password"
                placeholder="Enter new password"
                required
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
              />

              <TextField
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                required
                fullWidth
                variant="outlined"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />

              {errors.submit && (
                <Alert severity="error">
                  {errors.submit}
                </Alert>
              )}

              {message && (
                <Alert severity="success">
                  {message}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleResetPassword}
                disabled={isSubmitting}
                sx={{ mt: 2, py: 1.5 }}
                size="large"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Remember your password?{' '}
                <Button 
                  variant="text" 
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </FormContainer>
        </FormBox>
      </StyledBox>
    </AppTheme>
  );
};

export default ResetPassword;









