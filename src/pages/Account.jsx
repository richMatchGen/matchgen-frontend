import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import env from '../config/environment';

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Reset password form
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState('');
  
  // Account preferences
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    dark_mode: false,
    language: 'en'
  });

  // API Configuration

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${env.API_BASE_URL}/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      await axios.post(`${API_BASE_URL}users/change-password/`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPasswordDialogOpen(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setSuccess('Password changed successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordEmail) {
      setResetPasswordMessage('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetPasswordEmail)) {
      setResetPasswordMessage('Please enter a valid email address');
      return;
    }

    setResetPasswordLoading(true);
    setResetPasswordMessage('');

    try {
      await axios.post(`${API_BASE_URL}users/forgot-password/`, {
        email: resetPasswordEmail
      });
      
      setResetPasswordMessage('Password reset instructions have been sent to your email address.');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send reset instructions. Please try again.';
      setResetPasswordMessage(errorMessage);
      console.error('Reset password error:', error);
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handlePreferenceChange = (preference, value) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: value
    }));
  };

  const handleDeleteAccount = async () => {
    // Check if user has typed their email correctly
    if (deleteConfirmation !== user?.email) {
      setError('Please type your email address correctly to confirm account deletion.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.delete(`${API_BASE_URL}users/delete-account/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show success message briefly before redirecting
      setSuccess('Account deleted successfully. Redirecting...');
      
      // Clear local storage and redirect to login
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.response?.data?.error || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppTheme>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Account Settings" />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Security Settings */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <SecurityIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        Security
                      </Typography>
                    </Box>
                    
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Change Password"
                          secondary="Update your account password"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setPasswordDialogOpen(true)}
                          >
                            Change
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <Divider />
                      
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Reset Password"
                          secondary="Send password reset instructions to your email"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setResetPasswordDialogOpen(true)}
                          >
                            Reset
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <Divider />
                      
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Add an extra layer of security"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                          >
                            Coming Soon
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <Divider />
                      
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Login History"
                          secondary="View recent login activity"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                          >
                            Coming Soon
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Preferences */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <NotificationsIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        Preferences
                      </Typography>
                    </Box>
                    
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Receive updates via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.email_notifications}
                            onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <Divider />
                      
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Push Notifications"
                          secondary="Receive browser notifications"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.push_notifications}
                            onChange={(e) => handlePreferenceChange('push_notifications', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <Divider />
                      
                      <ListItem>
                        <ListItemIcon>
                          <PaletteIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Dark Mode"
                          secondary="Use dark theme"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={preferences.dark_mode}
                            onChange={(e) => handlePreferenceChange('dark_mode', e.target.checked)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      
                      <Divider />
                      
                      <ListItem>
                        <ListItemIcon>
                          <LanguageIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Language"
                          secondary="Choose your preferred language"
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            disabled
                          >
                            English
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Account Information */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Account Information
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Email Address
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {user?.email}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Member Since
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Last Login
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Account Status
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="success.main">
                            Active
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Danger Zone */}
              <Grid item xs={12}>
                <Card elevation={3} sx={{ border: '1px solid #ff6b6b' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#ff6b6b' }}>
                      Danger Zone
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      These actions are irreversible. Please proceed with caution.
                    </Typography>
                    
                                         <Button
                       variant="outlined"
                       color="error"
                       startIcon={<DeleteIcon />}
                       onClick={() => setDeleteDialogOpen(true)}
                     >
                       Delete Account
                     </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </AppTheme>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'white' }}>Change Password</DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
              margin="normal"
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
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={() => togglePasswordVisibility('current')}
                    sx={{ color: 'white' }}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
              margin="normal"
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
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={() => togglePasswordVisibility('new')}
                    sx={{ color: 'white' }}
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
              margin="normal"
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
              InputProps={{
                endAdornment: (
                  <IconButton 
                    onClick={() => togglePasswordVisibility('confirm')}
                    sx={{ color: 'white' }}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPasswordDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
                     <Button
             variant="contained"
             onClick={handlePasswordChange}
             disabled={loading}
             startIcon={<SaveIcon />}
           >
             Change Password
           </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)} 
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
        <DialogTitle sx={{ color: '#ff6b6b' }}>Delete Account</DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Typography variant="body1" paragraph sx={{ color: 'white' }}>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', paragraph: true }}>
            All your data, including club information, posts, and settings will be permanently deleted.
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', paragraph: true }}>
            To confirm deletion, please type your email address: <strong style={{ color: 'white' }}>{user?.email}</strong>
          </Typography>
          
          <TextField
            fullWidth
            label="Type your email to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            margin="normal"
            error={deleteConfirmation !== '' && deleteConfirmation !== user?.email}
            helperText={deleteConfirmation !== '' && deleteConfirmation !== user?.email ? 'Email does not match' : ''}
            sx={{
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#ff6b6b' }
              },
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteConfirmation('');
            }}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={loading || deleteConfirmation !== user?.email}
            startIcon={<DeleteIcon />}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog 
        open={resetPasswordDialogOpen} 
        onClose={() => {
          setResetPasswordDialogOpen(false);
          setResetPasswordEmail('');
          setResetPasswordMessage('');
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
            value={resetPasswordEmail}
            onChange={(e) => setResetPasswordEmail(e.target.value)}
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

          {resetPasswordMessage && (
            <Alert 
              severity={resetPasswordMessage.includes("sent") ? "success" : "error"} 
              sx={{ mt: 2 }}
            >
              {resetPasswordMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setResetPasswordDialogOpen(false);
              setResetPasswordEmail('');
              setResetPasswordMessage('');
            }}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            disabled={resetPasswordLoading}
            startIcon={resetPasswordLoading ? <CircularProgress size={20} /> : null}
          >
            {resetPasswordLoading ? "Sending..." : "Send Reset Instructions"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Account;
