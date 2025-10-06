import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  Paper,
  Stack,
  Chip,
  Divider,
  Avatar,
  CssBaseline
} from '@mui/material';
import {
  Send as SendIcon,
  Feedback as FeedbackIcon,
  BugReport as BugIcon,
  Lightbulb as IdeaIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/config';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const Feedback = () => {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    feedback_type: 'general',
    subject: '',
    message: '',
    rating: 0,
    allow_contact: false,
    subscribe_newsletter: false
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!formData.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter your feedback message',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiClient.post('feedback/submit/', {
        ...formData
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Thank you for your feedback! We\'ll get back to you soon.',
        severity: 'success'
      });

      // Reset form
      setFormData({
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        feedback_type: 'general',
        subject: '',
        message: '',
        rating: 0,
        allow_contact: false,
        subscribe_newsletter: false
      });

    } catch (error) {
      console.error('Feedback submission error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit feedback. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })}
        >
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={4} sx={{ width: '100%' }}>
              <Header />
              
              {/* Header */}
              <Box textAlign="center" sx={{ mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  We'd Love to Hear From You
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Your feedback helps us improve MatchGen and make it better for all sports clubs. Whether you have a suggestion, found a bug, or just want to say hello, we're listening.
                </Typography>
              </Box>

              <Grid container spacing={4}>
                {/* Contact Info */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 3, height: 'fit-content' }}>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Get in Touch
                      </Typography>
                      
                      <Stack spacing={3} sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Email
                            </Typography>
                            <Typography variant="body1">
                              support@matchgen.com
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Phone
                            </Typography>
                            <Typography variant="body1">
                              +1 (555) 123-4567
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Address
                            </Typography>
                            <Typography variant="body1">
                              123 Sports Street<br />
                              London, UK SW1A 1AA
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Feedback Form */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ p: 3 }}>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Send Us Your Feedback
                      </Typography>
                      
                      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Your Name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Feedback Type</InputLabel>
                              <Select
                                name="feedback_type"
                                value={formData.feedback_type}
                                onChange={handleInputChange}
                                label="Feedback Type"
                              >
                                <MenuItem value="general">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <FeedbackIcon sx={{ mr: 1 }} />
                                    General Feedback
                                  </Box>
                                </MenuItem>
                                <MenuItem value="bug">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BugIcon sx={{ mr: 1 }} />
                                    Bug Report
                                  </Box>
                                </MenuItem>
                                <MenuItem value="feature">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IdeaIcon sx={{ mr: 1 }} />
                                    Feature Request
                                  </Box>
                                </MenuItem>
                                <MenuItem value="support">
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <EmailIcon sx={{ mr: 1 }} />
                                    Support Request
                                  </Box>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              required
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                How would you rate your experience? (Optional)
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Button
                                    key={star}
                                    onClick={() => handleRatingChange(star)}
                                    sx={{
                                      minWidth: 'auto',
                                      p: 0.5,
                                      color: star <= formData.rating ? 'warning.main' : 'grey.400'
                                    }}
                                  >
                                    <StarIcon />
                                  </Button>
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Your Message"
                              name="message"
                              multiline
                              rows={4}
                              value={formData.message}
                              onChange={handleInputChange}
                              required
                              placeholder="Tell us what's on your mind..."
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Stack spacing={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="allow_contact"
                                    checked={formData.allow_contact}
                                    onChange={handleInputChange}
                                  />
                                }
                                label="I'd like to be contacted about this feedback"
                              />
                              
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="subscribe_newsletter"
                                    checked={formData.subscribe_newsletter}
                                    onChange={handleInputChange}
                                  />
                                }
                                label="Subscribe to our newsletter for updates and tips"
                              />
                            </Stack>
                          </Grid>
                          
                          <Grid item xs={12}>
                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              startIcon={<SendIcon />}
                              disabled={loading}
                              sx={{ minWidth: 200 }}
                            >
                              {loading ? 'Sending...' : 'Send Feedback'}
                            </Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* FAQ Section */}
              <Box sx={{ mt: 6 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
                  Frequently Asked Questions
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        How quickly will I get a response?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        We typically respond to feedback within 24-48 hours. For urgent issues, please mark them as "Bug Report" with high priority.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        What if I found a bug?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Please report bugs using the "Bug Report" option. Include as much detail as possible to help us reproduce the issue.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Is my feedback confidential?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Yes, all feedback is treated confidentially. We only use it to improve our service and will never share your personal information.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Can I request a new feature?
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Absolutely! Use the "Feature Request" option and describe what you'd like to see. We love hearing your ideas for improving MatchGen.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppTheme>
  );
};

export default Feedback;