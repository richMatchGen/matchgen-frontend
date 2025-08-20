import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  Download,
  Image,
  Schedule,
  LocationOn,
  SportsSoccer
} from '@mui/icons-material';
import axios from 'axios';

const MatchdayPostGenerator = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

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

  const generateMatchdayPost = async () => {
    if (!selectedMatch) {
      setSnackbar({
        open: true,
        message: 'Please select a fixture first',
        severity: 'warning'
      });
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/matchday-post/',
        { match_id: selectedMatch },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setGeneratedImage(response.data.image_url);
        setSnackbar({
          open: true,
          message: 'Matchday post generated successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Failed to generate post');
      }
    } catch (error) {
      console.error('Error generating matchday post:', error);
      setError(error.response?.data?.error || error.message || 'Failed to generate matchday post');
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || 'Failed to generate matchday post',
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
      a.download = `matchday-post-${selectedMatch}.png`;
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
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Typography variant="h5" gutterBottom>
        Generate Matchday Post
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a fixture to generate a matchday post with fixture details overlaid on your club's template.
      </Typography>

      <Grid container spacing={3}>
        {/* Fixture Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Fixture
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Choose a fixture</InputLabel>
                <Select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  label="Choose a fixture"
                >
                  {matches.map((match) => (
                    <MenuItem key={match.id} value={match.id}>
                      <Box>
                        <Typography variant="body2">
                          {match.opponent || 'Opponent TBC'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(match.date)} at {formatTime(match.time)}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedMatch && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Fixture:
                  </Typography>
                  {(() => {
                    const match = getSelectedMatchData();
                    return (
                      <Box>
                        <Chip 
                          icon={<SportsSoccer />}
                          label={`${match?.is_home ? 'HOME' : 'AWAY'} vs ${match?.opponent || 'Opponent TBC'}`}
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Schedule sx={{ mr: 1, fontSize: 16 }} />
                          <Typography variant="body2">
                            {formatDate(match?.date)} at {formatTime(match?.time)}
                          </Typography>
                        </Box>
                        {match?.venue && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                            <Typography variant="body2">
                              {match.venue}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })()}
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={generateMatchdayPost}
                disabled={!selectedMatch || generating}
                startIcon={generating ? <CircularProgress size={20} /> : <Image />}
                sx={{ mt: 2 }}
              >
                {generating ? 'Generating...' : 'Generate Matchday Post'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generated Post
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {generatedImage ? (
                <Box>
                  <img 
                    src={generatedImage} 
                    alt="Generated matchday post"
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      maxHeight: '400px',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={downloadImage}
                    startIcon={<Download />}
                    sx={{ mt: 2 }}
                  >
                    Download Image
                  </Button>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    backgroundColor: '#fafafa'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Generated image will appear here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
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

export default MatchdayPostGenerator;
