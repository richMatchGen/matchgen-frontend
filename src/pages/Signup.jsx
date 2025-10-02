import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Signup = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.token) {
      navigate('/dashboard');
    }
  }, [auth.token, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://matchgen-backend-production.up.railway.app/api/users/register/', formData);
      navigate('/login');
    } catch (err) {
      alert('Signup failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs">
      {auth.token && (
        <Button
          variant="outlined"
          onClick={logout}
          sx={{ 
            position: 'fixed', 
            top: '1rem', 
            right: '1rem', 
            zIndex: 1000
          }}
        >
          Logout
        </Button>
      )}
      <Box mt={8}>
        <Typography variant="h5" gutterBottom>Sign Up</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.email}
            required
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.password}
            required
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Create Account
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default Signup;
