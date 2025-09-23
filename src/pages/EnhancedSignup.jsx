import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = ['Create Account', 'Verify Email', 'Choose Plan', 'Setup Club'];

const EnhancedSignup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  // Step 1: Account creation
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Step 2: Plan selection
  const [selectedPlan, setSelectedPlan] = useState('');

  // Step 3: Club creation
  const [clubData, setClubData] = useState({
    name: '',
    sport: '',
    venue_name: '',
    location: '',
    primary_color: '#28443f',
    secondary_color: '#4a7c59',
    bio: '',
    league: '',
    website: '',
    founded_year: '',
    logo: null
  });

  // Removed graphic pack selection step

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Logo file size must be less than 5MB');
        return;
      }
      setClubData({
        ...clubData,
        logo: file
      });
      setError(''); // Clear any previous errors
    }
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

  const validatePlanSelection = () => {
    if (!selectedPlan) {
      setError('Please select a pricing plan');
      return false;
    }
    return true;
  };

  const validateClubData = () => {
    if (!clubData.name || !clubData.sport) {
      setError('Club name and sport are required');
      return false;
    }
    if (!clubData.logo) {
      setError('Please upload a club logo');
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

      setSuccess('Account created successfully! Please check your email to verify your account.');
      setActiveStep(1); // Move to verification step
    } catch (err) {
      setError(err.response?.data?.error || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  const checkEmailVerification = async () => {
    setLoading(true);
    setError('');

    try {
      // Try to login to check if email is verified
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/token/',
        {
          email: accountData.email,
          password: accountData.password
        }
      );

      // If login succeeds, email is verified
      setEmailVerified(true);
      setSuccess('Email verified successfully! You can now continue with club setup.');
      setActiveStep(2); // Move to club setup step
      
      // Store tokens
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    } catch (err) {
      setError('Email not yet verified. Please check your inbox and click the verification link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/resend-verification-signup/',
        { email: accountData.email }
      );

      setSuccess('Verification email sent successfully! Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification email');
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

      // Create FormData for logo upload
      const formData = new FormData();
      formData.append('name', clubData.name);
      formData.append('sport', clubData.sport);
      formData.append('venue_name', clubData.venue_name);
      formData.append('location', clubData.location);
      formData.append('primary_color', clubData.primary_color);
      formData.append('secondary_color', clubData.secondary_color);
      formData.append('bio', clubData.bio);
      formData.append('league', clubData.league);
      formData.append('website', clubData.website);
      formData.append('subscription_tier', selectedPlan); // Add selected plan
      if (clubData.founded_year) {
        formData.append('founded_year', clubData.founded_year);
      }
      if (clubData.logo) {
        formData.append('logo', clubData.logo);
      }

      // Create club
      const clubResponse = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/club/enhanced/',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Club created successfully! Redirecting to subscription setup...');
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

  // Removed handleFinishSetup function - no longer needed

  const handleNext = () => {
    if (activeStep === 0) {
      handleCreateAccount();
    } else if (activeStep === 1) {
      checkEmailVerification();
    } else if (activeStep === 2) {
      if (validatePlanSelection()) {
        setActiveStep(3);
      }
    } else if (activeStep === 3) {
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
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={accountData.password}
              onChange={handleAccountChange}
              margin="normal"
              required
              helperText="Password must be at least 8 characters long"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={accountData.confirmPassword}
              onChange={handleAccountChange}
              margin="normal"
              required
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
              We've sent a verification link to <strong>{accountData.email}</strong>. 
              Please check your inbox and click the link to verify your account.
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
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                onClick={checkEmailVerification}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Checking...' : 'I\'ve Verified My Email'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleResendVerification}
                disabled={loading}
              >
                Resend Email
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Your Plan
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Select the pricing plan that best fits your needs. You can always upgrade or downgrade later.
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlan === 'basic' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    backgroundColor: selectedPlan === 'basic' ? '#f3f8ff' : 'white'
                  }}
                  onClick={() => setSelectedPlan('basic')}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Gen
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      £9.99
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      per month
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Upcoming Fixture Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Matchday Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Starting XI Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ 1 Team</Typography>
                      <Typography variant="body2">✓ Basic Templates</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlan === 'semipro' ? '2px solid #9c27b0' : '1px solid #e0e0e0',
                    backgroundColor: selectedPlan === 'semipro' ? '#faf5ff' : 'white',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedPlan('semipro')}
                >
                  <Chip 
                    label="Recommended" 
                    color="secondary" 
                    size="small" 
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      SemiPro Gen
                    </Typography>
                    <Typography variant="h4" color="secondary" gutterBottom>
                      £14.99
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      per month
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Everything in Basic</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Substitution Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Half Time Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Full Time Posts</Typography>
                      <Typography variant="body2">✓ Enhanced Templates</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedPlan === 'prem' ? '2px solid #ed6c02' : '1px solid #e0e0e0',
                    backgroundColor: selectedPlan === 'prem' ? '#fff8f0' : 'white'
                  }}
                  onClick={() => setSelectedPlan('prem')}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Prem Gen
                    </Typography>
                    <Typography variant="h4" color="warning.main" gutterBottom>
                      £24.99
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      per month
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Everything in SemiPro</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Goal Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Player of the Match Posts</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Multiple Teams</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>✓ Bespoke Templates</Typography>
                      <Typography variant="body2">✓ Priority Support</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Setup Your Club
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Club Name"
                  name="name"
                  value={clubData.name}
                  onChange={handleClubChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue Name (Optional)"
                  name="venue_name"
                  value={clubData.venue_name}
                  onChange={handleClubChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location (Optional)"
                  name="location"
                  value={clubData.location}
                  onChange={handleClubChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Club Bio (Optional)"
                  name="bio"
                  value={clubData.bio}
                  onChange={handleClubChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="League (Optional)"
                  name="league"
                  value={clubData.league}
                  onChange={handleClubChange}
                  margin="normal"
                  placeholder="e.g., Premier League, NBA, etc."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website (Optional)"
                  name="website"
                  type="url"
                  value={clubData.website}
                  onChange={handleClubChange}
                  margin="normal"
                  placeholder="https://yourclub.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Founded Year (Optional)"
                  name="founded_year"
                  type="number"
                  value={clubData.founded_year}
                  onChange={handleClubChange}
                  margin="normal"
                  placeholder="e.g., 1995"
                  inputProps={{ min: 1800, max: new Date().getFullYear() }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Club Logo (Required)
                </Typography>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<span>📷</span>}
                    sx={{ mb: 2 }}
                  >
                    {clubData.logo ? clubData.logo.name : 'Upload Logo'}
                  </Button>
                </label>
                {clubData.logo && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={URL.createObjectURL(clubData.logo)}
                      alt="Club Logo Preview"
                      style={{
                        maxWidth: '100px',
                        maxHeight: '100px',
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {clubData.logo.name} ({(clubData.logo.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Accepted formats: JPG, PNG, GIF. Max size: 5MB
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      // Removed case 3 - Choose Graphic Pack step

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Welcome to MatchGen
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
            Create your account and set up your club in just a few steps
          </Typography>

          <Stepper activeStep={activeStep} sx={{ my: 4 }}>
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

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === 0 ? (
                'Create Account'
              ) : activeStep === 1 ? (
                'Verify Email'
              ) : activeStep === 2 ? (
                'Choose Plan'
              ) : (
                'Create Club'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EnhancedSignup;
