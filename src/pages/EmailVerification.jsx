import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import env from '../config/environment';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verified, setVerified] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/verify-email/',
        { token: verificationToken }
      );

      setSuccess('Email verified successfully! You can now create your club.');
      setVerified(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Email verification failed');
      setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, try to login to get token
      const loginResponse = await axios.post(
        `${env.API_BASE_URL}/users/token/`,
        { email, password: '' } // We'll handle this differently
      );

      // If login succeeds, user is already verified
      setSuccess('Your email is already verified! You can now log in.');
      setVerified(true);
    } catch (loginErr) {
      // If login fails, try to resend verification
      try {
        await axios.post(
          'https://matchgen-backend-production.up.railway.app/api/users/resend-verification/',
          {},
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          }
        );

        setSuccess('Verification email sent successfully! Please check your inbox.');
      } catch (resendErr) {
        setError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/enhanced-signup');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              Verifying your email...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" gutterBottom>
            Email Verification
          </Typography>

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

          {verified ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Your email has been verified successfully! You can now create your club and start using MatchGen.
              </Typography>
              <Button
                variant="contained"
                onClick={handleContinue}
                sx={{ mr: 2 }}
              >
                Create Club
              </Button>
              <Button
                variant="outlined"
                onClick={handleLogin}
              >
                Go to Login
              </Button>
            </Box>
          ) : showResend ? (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                The verification link has expired or is invalid. Please enter your email to receive a new verification link.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleResendVerification}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Resend Verification Email'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Please check your email and click the verification link to continue.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmailVerification;
