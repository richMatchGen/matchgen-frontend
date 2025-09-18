import React, { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Collapse,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const EmailVerificationBanner = ({ user, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/users/resend-verification/',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess('Verification email sent successfully! Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  // Debug: Log user data received by EmailVerificationBanner
  console.log('🔍 EmailVerificationBanner user data:', user);
  console.log('🔍 EmailVerificationBanner email_verified:', user?.email_verified);
  console.log('🔍 EmailVerificationBanner should show banner:', !user?.email_verified);

  // Don't show banner if user is verified
  if (user?.email_verified) {
    // Debug: Log when user is verified (helps identify auto-verification issues)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 User is verified:', user.email, 'email_verified:', user.email_verified);
    }
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity="warning" 
        action={
          <Button
            color="inherit"
            size="small"
            onClick={handleResendVerification}
            disabled={loading}
          >
            {loading ? <CircularProgress size={16} /> : 'Resend Email'}
          </Button>
        }
      >
        <AlertTitle>Email Verification Required</AlertTitle>
        Please verify your email address to access all features. 
        Check your inbox for a verification link, or click "Resend Email" to receive a new one.
        
        {error && (
          <Box sx={{ mt: 1 }}>
            <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
              {error}
            </Alert>
          </Box>
        )}
        
        {success && (
          <Box sx={{ mt: 1 }}>
            <Alert severity="success" sx={{ fontSize: '0.875rem' }}>
              {success}
            </Alert>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default EmailVerificationBanner;
