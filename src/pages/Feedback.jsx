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
  Avatar
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
import useAuth from '../hooks/useAuth';
import apiClient from '../api/config';

const Feedback = () => {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    name: auth.user?.name || '',
    email: auth.user?.email || '',
    feedbackType: 'general',
    subject: '',
    message: '',
    rating: 5,
    allowContact: true,
    subscribeNewsletter: false
  });
  
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: <FeedbackIcon /> },
    { value: 'bug', label: 'Bug Report', icon: <BugIcon /> },
    { value: 'feature', label: 'Feature Request', icon: <IdeaIcon /> },
    { value: 'support', label: 'Technical Support', icon: <PhoneIcon /> },
    { value: 'billing', label: 'Billing Question', icon: <EmailIcon /> }
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleCheckboxChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
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
        ...formData,
        user_id: auth.user?.id,
        timestamp: new Date().toISOString()
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
        feedbackType: 'general',
        subject: '',
        message: '',
        rating: 5,
        allowContact: true,
        subscribeNewsletter: false
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
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
                        Office
                      </Typography>
                      <Typography variant="body1">
                        London, UK
                      </Typography>
                    </Box>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Response Time
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We typically respond within 24 hours during business days. For urgent issues, please call us directly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feedback Form */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Feedback Type */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>What's this about?</InputLabel>
                        <Select
                          value={formData.feedbackType}
                          onChange={handleChange('feedbackType')}
                          label="What's this about?"
                        >
                          {feedbackTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {type.icon}
                                <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Name and Email */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={formData.name}
                        onChange={handleChange('name')}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        required
                      />
                    </Grid>

                    {/* Subject */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        value={formData.subject}
                        onChange={handleChange('subject')}
                        placeholder="Brief description of your feedback"
                      />
                    </Grid>

                    {/* Rating */}
                    <Grid item xs={12}>
                      <Typography variant="body1" gutterBottom>
                        How would you rate your experience with MatchGen?
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            onClick={() => handleRatingChange(rating)}
                            sx={{
                              minWidth: 'auto',
                              p: 0.5,
                              color: rating <= formData.rating ? 'warning.main' : 'grey.400'
                            }}
                          >
                            <StarIcon />
                          </Button>
                        ))}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, alignSelf: 'center' }}>
                          {formData.rating === 5 ? 'Excellent' : 
                           formData.rating === 4 ? 'Good' :
                           formData.rating === 3 ? 'Average' :
                           formData.rating === 2 ? 'Poor' : 'Very Poor'}
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* Message */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange('message')}
                        placeholder="Tell us more about your feedback, suggestions, or any issues you're experiencing..."
                        required
                      />
                    </Grid>

                    {/* Checkboxes */}
                    <Grid item xs={12}>
                      <Stack spacing={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.allowContact}
                              onChange={handleCheckboxChange('allowContact')}
                            />
                          }
                          label="I'd like to be contacted about this feedback"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.subscribeNewsletter}
                              onChange={handleCheckboxChange('subscribeNewsletter')}
                            />
                          }
                          label="Subscribe to our newsletter for updates and tips"
                        />
                      </Stack>
                    </Grid>

                    {/* Submit Button */}
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
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
            Frequently Asked Questions
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  How quickly will I get a response?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We typically respond within 24 hours during business days. For urgent technical issues, we aim to respond within 4 hours.
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Can I request new features?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Absolutely! We love hearing feature requests from our users. Select "Feature Request" in the feedback type above.
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
          </Grid>
        </Box>
      </Container>

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
    </Box>
  );
};

export default Feedback;
