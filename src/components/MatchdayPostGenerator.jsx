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
  Chip,
  Paper
} from '@mui/material';
import {
  Download,
  Image,
  Schedule,
  LocationOn,
  SportsSoccer,
  CheckCircle
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
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/generate-matchday-post/',
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

  const testBackend = async () => {
    try {
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/test/'
      );
      console.log('Test response:', response.data);
      setSnackbar({
        open: true,
        message: 'Backend test successful!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Backend test failed:', error);
      setSnackbar({
        open: true,
        message: 'Backend test failed',
        severity: 'error'
      });
    }
  };

  const testBasicFunctionality = async () => {
    try {
      const response = await axios.put(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/test/'
      );
      console.log('Basic functionality test response:', response.data);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.status === 'success' ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Basic functionality test failed:', error);
      setSnackbar({
        open: true,
        message: 'Basic functionality test failed',
        severity: 'error'
      });
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const response = await axios.patch(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/test/'
      );
      console.log('Database connection test response:', response.data);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.status === 'success' ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Database connection test failed:', error);
      setSnackbar({
        open: true,
        message: 'Database connection test failed',
        severity: 'error'
      });
    }
  };

  const testViewFunctionality = async () => {
    try {
      const response = await axios.delete(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/test/'
      );
      console.log('View functionality test response:', response.data);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.status === 'success' ? 'success' : 'error'
      });
    } catch (error) {
      console.error('View functionality test failed:', error);
      setSnackbar({
        open: true,
        message: 'View functionality test failed',
        severity: 'error'
      });
    }
  };

  const testDatabase = async () => {
    try {
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/test/'
      );
      console.log('Database test response:', response.data);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: response.data.status === 'success' ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Database test failed:', error);
      setSnackbar({
        open: true,
        message: 'Database test failed',
        severity: 'error'
      });
    }
  };

  const createTestData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/create-test-data/',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Test data created:', response.data);
      setSnackbar({
        open: true,
        message: 'Test data created successfully!',
        severity: 'success'
      });
      // Refresh debug data to show the new packs
      setTimeout(() => {
        debugTemplates();
      }, 1000);
    } catch (error) {
      console.error('Error creating test data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create test data',
        severity: 'error'
      });
    }
  };

  const runDiagnostic = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/diagnostic/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Diagnostic result:', response.data);
      setDebugData(response.data);
      setSnackbar({
        open: true,
        message: response.data.status === 'ready' ? 'System ready for matchday posts!' : 'System needs setup',
        severity: response.data.status === 'ready' ? 'success' : 'warning'
      });
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setSnackbar({
        open: true,
        message: 'Diagnostic failed',
        severity: 'error'
      });
    }
  };

  const testSimple = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/simple-test/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Simple test result:', response.data);
      setDebugData(response.data);
      setSnackbar({
        open: true,
        message: 'Simple test successful!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Simple test failed:', error);
      setSnackbar({
        open: true,
        message: 'Simple test failed',
        severity: 'error'
      });
    }
  };

  const testTemplateDebug = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/template-debug/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Template debug result:', response.data);
      setDebugData(response.data);
      setSnackbar({
        open: true,
        message: 'Template debug successful!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Template debug failed:', error);
      setSnackbar({
        open: true,
        message: 'Template debug failed',
        severity: 'error'
      });
    }
  };

  const debugTemplates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/debug-templates/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDebugData(response.data);
      console.log('Debug data:', response.data);
      setSnackbar({
        open: true,
        message: 'Debug data loaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error fetching debug data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load debug data',
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
      // time_start is a string like "15:00", convert to time object for formatting
      const [hours, minutes] = timeString.split(':');
      const time = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString; // Return as-is if parsing fails
    }
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Generate Matchday Post
      </Typography>
      
             <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
         Select a fixture to generate a high-quality matchday post with fixture details overlaid on your club's template.
       </Typography>

       <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
         <Button
           variant="outlined"
           onClick={testBackend}
         >
           Test Backend
         </Button>
         <Button
           variant="outlined"
           onClick={testBasicFunctionality}
         >
           Test Basic
         </Button>
         <Button
           variant="outlined"
           onClick={testViewFunctionality}
         >
           Test View
         </Button>
         <Button
           variant="outlined"
           onClick={testDatabaseConnection}
         >
           Test DB Connection
         </Button>
         <Button
           variant="outlined"
           onClick={testDatabase}
         >
           Test Database
         </Button>
         <Button
           variant="outlined"
           onClick={debugTemplates}
         >
           Debug Templates
         </Button>
                   <Button
            variant="outlined"
            onClick={createTestData}
            color="secondary"
          >
            Create Test Data
          </Button>
          <Button
            variant="outlined"
            onClick={runDiagnostic}
            color="primary"
          >
            Run Diagnostic
          </Button>
          <Button
            variant="outlined"
            onClick={testSimple}
            color="secondary"
          >
            Simple Test
          </Button>
          <Button
            variant="outlined"
            onClick={testTemplateDebug}
            color="warning"
          >
            Template Debug
          </Button>
       </Box>

      <Grid container spacing={3}>
        {/* Fixture Selection */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Select Fixture
              </Typography>
              
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

              {selectedMatch && (
                <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Selected Fixture:
                  </Typography>
                  {(() => {
                    const match = getSelectedMatchData();
                    return (
                      <Box>
                        <Chip 
                          icon={<SportsSoccer />}
                          label={`HOME vs ${match?.opponent || 'Opponent TBC'}`}
                          color="primary"
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
                onClick={generateMatchdayPost}
                disabled={!selectedMatch || generating}
                startIcon={generating ? <CircularProgress size={20} /> : <Image />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  fontWeight: 'bold',
                  fontSize: '1.1rem'
                }}
              >
                {generating ? 'Generating...' : 'Generate Matchday Post'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Image */}
        <Grid item xs={12} md={6}>
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
                      alt="Generated matchday post"
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
                <Paper 
                  elevation={1}
                  sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    backgroundColor: 'grey.50'
                  }}
                >
                  <Box textAlign="center">
                    <Image sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Generated image will appear here
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select a fixture and click generate
                    </Typography>
                  </Box>
                </Paper>
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
                 </Alert>
       </Snackbar>

       {/* Debug Data Display */}
       {debugData && (
         <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 1, backgroundColor: '#f5f5f5' }}>
           <Typography variant="h6" gutterBottom>Debug Data:</Typography>
           <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
             {JSON.stringify(debugData, null, 2)}
           </pre>
         </Box>
       )}
     </Box>
   );
 };

export default MatchdayPostGenerator;
