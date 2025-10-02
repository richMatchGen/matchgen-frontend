import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
  CssBaseline,
  Divider,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff, Email, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import AppTheme from '../themes/AppTheme';
import ColorModeSelect from '../themes/colormodeselect';
import Sitemark from '../components/Sitemarkicon';

const steps = ['Create Account', 'Verify Email', 'Setup Club'];

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
  maxWidth: 600,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const EnhancedSignup2 = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.token) {
      navigate('/dashboard');
    }
  }, [auth.token, navigate]);

  // Step 1: Account creation
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Step 2: Email verification code
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Step 3: Club creation (simplified)
  const [clubData, setClubData] = useState({
    name: '',
    sport: ''
  });

  const handleAccountChange = (e) => {
    setAccountData({
      ...accountData,
      [e.target.name]: e.target.value
    });
  };

  const handleClubChange = (e) => {
    setClubData({
      ...clubData,
      [e.target.name]: e.target.value
    });
  };

  const validateAccountData = () => {
    if (!accountData.email || !accountData.password || !accountData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (accountData.password !== accountData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (accountData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const validateClubData = () => {
    if (!clubData.name || !clubData.sport) {
      setError('Club name and sport are required');
      return false;
    }
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateAccountData()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/register/',
        {
          email: accountData.email,
          password: accountData.password
        }
      );

      setSuccess('Account created successfully! Please check your email for the verification code.');
      setCodeSent(true);
      setActiveStep(1); // Move to verification step
    } catch (err) {
      setError(err.response?.data?.error || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/send-verification-code/',
        { email: accountData.email }
      );

      setSuccess('Verification code sent successfully! Please check your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/verify-email-code/',
        {
          email: accountData.email,
          code: verificationCode
        }
      );

      setEmailVerified(true);
      setSuccess('Email verified successfully! You can now continue with club setup.');
      setActiveStep(2); // Move to club setup step
      
      // Store tokens if provided
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClub = async () => {
    if (!validateClubData()) return;

    setLoading(true);
    setError('');

    try {
      // First, login to get token
      const loginResponse = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/token/',
        {
          email: accountData.email,
          password: accountData.password
        }
      );

      const token = loginResponse.data.access;

      // Create club with minimal data
      const clubResponse = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/club/enhanced/',
        {
          name: clubData.name,
          sport: clubData.sport,
          venue_name: '',
          location: '',
          primary_color: '#28443f',
          secondary_color: '#4a7c59',
          bio: '',
          league: '',
          website: '',
          founded_year: null
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Club created successfully! Please choose your subscription plan to get started.');
      setTimeout(() => {
        navigate('/subscription');
      }, 2000);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', loginResponse.data.refresh);
    } catch (err) {
      setError(err.response?.data?.error || 'Club creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      handleCreateAccount();
    } else if (activeStep === 1) {
      handleVerifyCode();
    } else if (activeStep === 2) {
      handleCreateClub();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Your Account
            </Typography>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={accountData.email}
              onChange={handleAccountChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={accountData.password}
              onChange={handleAccountChange}
              margin="normal"
              required
              helperText="Password must be at least 8 characters long"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={accountData.confirmPassword}
              onChange={handleAccountChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Your Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              We've sent a 6-digit verification code to <strong>{accountData.email}</strong>. 
              Please enter the code below to verify your account.
            </Typography>
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              margin="normal"
              placeholder="Enter 6-digit code"
              inputProps={{ 
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  letterSpacing: '0.2em'
                }
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleResendCode}
                disabled={loading}
                startIcon={<Email />}
              >
                Resend Code
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Setup Your Club
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Just a few details to get you started. You can add more information later.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Club Name"
                  name="name"
                  value={clubData.name}
                  onChange={handleClubChange}
                  margin="normal"
                  required
                  placeholder="e.g., Manchester United, Lakers, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Sport</InputLabel>
                  <Select
                    name="sport"
                    value={clubData.sport}
                    onChange={handleClubChange}
                    label="Sport"
                  >
                    <MenuItem value="Football">Football</MenuItem>
                    <MenuItem value="Basketball">Basketball</MenuItem>
                    <MenuItem value="Tennis">Tennis</MenuItem>
                    <MenuItem value="Cricket">Cricket</MenuItem>
                    <MenuItem value="Rugby">Rugby</MenuItem>
                    <MenuItem value="Hockey">Hockey</MenuItem>
                    <MenuItem value="Baseball">Baseball</MenuItem>
                    <MenuItem value="Volleyball">Volleyball</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
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
          <Box sx={{ textAlign: 'center', color: 'white', p: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              Join Us!
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Create your club's digital presence in minutes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Professional graphics</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Team management</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: 'white', borderRadius: '50%' }} />
                <Typography variant="body1">Social media automation</Typography>
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
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Set up your club in just a few steps
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ my: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Card sx={{ p: 3, mb: 3 }}>
              {renderStepContent(activeStep)}
            </Card>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                sx={{ minWidth: 120 }}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? (
                  'Processing...'
                ) : activeStep === 0 ? (
                  'Create Account'
                ) : activeStep === 1 ? (
                  'Verify Email'
                ) : (
                  'Create Club'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" variant="body2" sx={{ fontWeight: 'bold' }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </FormContainer>
        </FormBox>
      </StyledBox>
    </AppTheme>
  );
};

export default EnhancedSignup2;
