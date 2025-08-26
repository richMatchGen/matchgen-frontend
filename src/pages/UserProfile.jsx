import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  // API Configuration
  const API_BASE_URL = import.meta.env.MODE === 'production' 
    ? 'https://matchgen-backend-production.up.railway.app/api/'
    : 'http://localhost:8000/api/';

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch user data
      const userResponse = await axios.get(`${API_BASE_URL}users/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch club data
      const clubResponse = await axios.get(`${API_BASE_URL}users/my-club/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(userResponse.data);
      setClub(clubResponse.data);
      setEditForm({
        first_name: userResponse.data.first_name || '',
        last_name: userResponse.data.last_name || '',
        email: userResponse.data.email || '',
        phone: userResponse.data.phone || ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.patch(`${API_BASE_URL}users/profile/`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
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
          <Header title="User Profile" />
          
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
              {/* Profile Header */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box position="relative">
                        <Avatar
                          sx={{ width: 120, height: 120, fontSize: '3rem' }}
                          src={user?.avatar}
                        >
                          {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </Avatar>
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                          onClick={() => setAvatarDialogOpen(true)}
                        >
                          <PhotoCameraIcon />
                        </IconButton>
                      </Box>
                      
                      <Box flex={1}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                          {user?.first_name} {user?.last_name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          {user?.email}
                        </Typography>
                        {club && (
                          <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <BusinessIcon color="action" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              {club.name}
                            </Typography>
                            <Chip 
                              label={club.subscription_tier === 'prem' ? 'Prem Gen' : club.subscription_tier} 
                              color={club.subscription_tier === 'prem' ? 'warning' : 'primary'}
                              size="small"
                            />
                          </Box>
                        )}
                      </Box>
                      
                      <Box>
                        {!editing ? (
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleEdit}
                          >
                            Edit Profile
                          </Button>
                        ) : (
                          <Box display="flex" gap={1}>
                            <Button
                              variant="contained"
                              startIcon={<SaveIcon />}
                              onClick={handleSave}
                              disabled={loading}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<CancelIcon />}
                              onClick={handleCancel}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Personal Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          value={editing ? editForm.first_name : (user?.first_name || '')}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          disabled={!editing}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          value={editing ? editForm.last_name : (user?.last_name || '')}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          disabled={!editing}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={editing ? editForm.email : (user?.email || '')}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!editing}
                          margin="normal"
                          InputProps={{
                            startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone"
                          value={editing ? editForm.phone : (user?.phone || '')}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!editing}
                          margin="normal"
                          InputProps={{
                            startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Account Information */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Account Information
                    </Typography>
                    
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Member Since
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Paper>
                      
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Last Login
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Paper>
                      
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Account Status
                        </Typography>
                        <Chip 
                          label={user?.is_active ? 'Active' : 'Inactive'} 
                          color={user?.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </Paper>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Club Information */}
              {club && (
                <Grid item xs={12}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Club Information
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <BusinessIcon color="primary" />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Club Name
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {club.name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {club.location && (
                            <Box display="flex" alignItems="center" gap={2} mb={2}>
                              <LocationIcon color="action" />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Location
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {club.location}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Chip 
                              label={club.subscription_tier === 'prem' ? 'Prem Gen' : club.subscription_tier} 
                              color={club.subscription_tier === 'prem' ? 'warning' : 'primary'}
                            />
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Subscription Plan
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {club.subscription_active ? 'Active' : 'Inactive'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {club.sport && (
                            <Box display="flex" alignItems="center" gap={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Sport
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {club.sport}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      </AppTheme>

      {/* Avatar Upload Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Profile picture upload functionality will be implemented in a future update.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
