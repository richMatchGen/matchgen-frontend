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

const steps = ['Create Account', 'Setup Club'];

const EnhancedSignup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Step 1: Account creation
  const [accountData, setAccountData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Step 2: Club creation
  const [clubData, setClubData] = useState({
    name: '',
    sport: '',
    venue_name: '',
    location: '',
    primary_color: '#28443f',
    secondary_color: '#4a7c59',
    bio: '',
    graphic_pack_id: ''
  });

  const [graphicPacks, setGraphicPacks] = useState([]);

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

      setSuccess('Account created successfully! Please check your email to verify your account.');
      setActiveStep(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Account creation failed');
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

      // Create club
      const clubResponse = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/club/enhanced/',
        clubData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Club created successfully! Redirecting to dashboard...');
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', loginResponse.data.refresh);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Club creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      handleCreateAccount();
    } else {
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
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Graphic Pack Selection (Optional)
                </Typography>
                <Chip 
                  label="Choose Later" 
                  variant="outlined" 
                  color="primary"
                  onClick={() => setClubData({...clubData, graphic_pack_id: ''})}
                />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  You can select a graphic pack later from your dashboard
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

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
              ) : activeStep === steps.length - 1 ? (
                'Create Club'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EnhancedSignup;
