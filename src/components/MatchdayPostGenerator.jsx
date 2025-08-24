import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Download,
  Image,
  Schedule,
  LocationOn,
  SportsSoccer,
  CheckCircle,
  ArrowBack,
  Group,
  Event,
  EmojiEvents,
  SwapHoriz,
  Person,
  Timer,
  Flag
} from '@mui/icons-material';
import axios from 'axios';

// Post type definitions
const POST_TYPES = [
  { 
    id: 'matchday', 
    label: 'Matchday', 
    icon: <Event />, 
    description: 'Pre-match announcement with fixture details',
    color: 'primary'
  },
  { 
    id: 'upcoming', 
    label: 'Upcoming Fixture', 
    icon: <Schedule />, 
    description: 'Future fixture announcement',
    color: 'info'
  },
  { 
    id: 'startingxi', 
    label: 'Starting XI', 
    icon: <Group />, 
    description: 'Team lineup announcement',
    color: 'success'
  },
  { 
    id: 'goal', 
    label: 'Goal', 
    icon: <SportsSoccer />, 
    description: 'Goal celebration post',
    color: 'warning'
  },
  { 
    id: 'sub', 
    label: 'Substitution', 
    icon: <SwapHoriz />, 
    description: 'Player substitution announcement',
    color: 'secondary'
  },
  { 
    id: 'player_of_match', 
    label: 'Player of the Match', 
    icon: <EmojiEvents />, 
    description: 'Man of the match announcement',
    color: 'warning'
  },
  { 
    id: 'half_time', 
    label: 'Half Time', 
    icon: <Timer />, 
    description: 'Half-time score update',
    color: 'info'
  },
  { 
    id: 'full_time', 
    label: 'Full Time', 
    icon: <Flag />, 
    description: 'Final result announcement',
    color: 'success'
  }
];

const SocialMediaPostGenerator = () => {
  const { fixtureId, postType } = useParams(); // Get fixture ID and post type from URL
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(fixtureId || '');
  const [selectedPostType, setSelectedPostType] = useState(postType || 'matchday');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [debugData, setDebugData] = useState(null);

  // Fetch matches on component mount
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/content/matches/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatches(response.data.results || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const generatePost = async () => {
    if (!selectedMatch) {
      setSnackbar({
        open: true,
        message: 'Please select a fixture first',
        severity: 'warning'
      });
      return;
    }

    try {
      console.log('=== FRONTEND: Starting post generation ===');
      console.log('Selected match ID:', selectedMatch);
      console.log('Selected post type:', selectedPostType);
      
      setGenerating(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      console.log('Making API request to generate post...');
      
      // Use the appropriate endpoint based on post type
      const endpoint = selectedPostType === 'matchday' 
        ? '/api/graphicpack/generate-matchday-post/'
        : `/api/graphicpack/generate-${selectedPostType}-post/`;
      
      const response = await axios.post(
        `https://matchgen-backend-production.up.railway.app${endpoint}`,
        { match_id: selectedMatch },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('=== FRONTEND: API Response ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success) {
        setGeneratedImage(response.data.image_url);
        setSnackbar({
          open: true,
          message: `${POST_TYPES.find(pt => pt.id === selectedPostType)?.label} post generated successfully!`,
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate post');
      }
    } catch (error) {
      console.log('=== FRONTEND: Error occurred ===');
      console.error('Error generating post:', error);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);
      
      setError(error.response?.data?.error || error.message || 'Failed to generate post');
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || 'Failed to generate post',
        severity: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedPostType}-post-${selectedMatch}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSnackbar({
        open: true,
        message: 'Image downloaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download image',
        severity: 'error'
      });
    }
  };

  const getSelectedMatchData = () => {
    return matches.find(match => match.id === selectedMatch);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBC';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBC';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  const handlePostTypeChange = (event, newValue) => {
    setSelectedPostType(newValue);
    setGeneratedImage(null); // Clear previous generated image
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {fixtureId && (
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Back to Dashboard
            </Button>
          )}
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Social Media Post Generator
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Generate professional social media posts for your club's matches and events.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Post Type Selection */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Post Type
              </Typography>
              
              <Tabs
                value={selectedPostType}
                onChange={handlePostTypeChange}
                orientation="vertical"
                variant="scrollable"
                sx={{ borderRight: 1, borderColor: 'divider', minHeight: 400 }}
              >
                {POST_TYPES.map((postType) => (
                  <Tab
                    key={postType.id}
                    value={postType.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                        <Box sx={{ mr: 1, color: `${postType.color}.main` }}>
                          {postType.icon}
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {postType.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {postType.description}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ 
                      alignItems: 'flex-start',
                      minHeight: 60,
                      '&.Mui-selected': {
                        backgroundColor: `${postType.color}.50`,
                        color: `${postType.color}.main`
                      }
                    }}
                  />
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </Grid>

        {/* Center Panel - Fixture Selection & Details */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {fixtureId ? 'Fixture Details' : 'Select Fixture'}
              </Typography>
              
              {!fixtureId && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Choose a fixture</InputLabel>
                  <Select
                    value={selectedMatch}
                    onChange={(e) => setSelectedMatch(e.target.value)}
                    label="Choose a fixture"
                  >
                    {matches.map((match) => (
                      <MenuItem key={match.id} value={match.id}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {match.opponent || 'Opponent TBC'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(match.date)} at {formatTime(match.time_start)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedMatch && (
                <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                  {(() => {
                    const match = getSelectedMatchData();
                    return (
                      <Box>
                        <Chip 
                          icon={<SportsSoccer />}
                          label={`${match?.home_away || 'HOME'} vs ${match?.opponent || 'Opponent TBC'}`}
                          color={match?.home_away === 'HOME' ? 'primary' : 'secondary'}
                          sx={{ mb: 2, fontWeight: 'bold' }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Schedule sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {formatDate(match?.date)} at {formatTime(match?.time_start)}
                          </Typography>
                        </Box>
                        {match?.venue && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="body2">
                              {match.venue}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </Paper>
              )}

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={generatePost}
                disabled={!selectedMatch || generating}
                startIcon={generating ? <CircularProgress size={20} /> : <Image />}
                sx={{ 
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {generating ? 'Generating...' : `Generate ${POST_TYPES.find(pt => pt.id === selectedPostType)?.label} Post`}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel - Generated Image */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Generated Post
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {generatedImage ? (
                <Box>
                  <Paper elevation={2} sx={{ p: 1, mb: 2, backgroundColor: 'grey.50' }}>
                    <img 
                      src={generatedImage} 
                      alt="Generated social media post"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }}
                    />
                  </Paper>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={downloadImage}
                      startIcon={<Download />}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 'bold'
                      }}
                    >
                      Download Image
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setGeneratedImage(null);
                        setSelectedMatch('');
                      }}
                      startIcon={<CheckCircle />}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 'bold'
                      }}
                    >
                      Generate Another
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  minHeight: 300,
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  border: '2px dashed #ccc'
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Generated post will appear here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SocialMediaPostGenerator;
