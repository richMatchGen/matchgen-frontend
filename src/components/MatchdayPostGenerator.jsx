import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Divider,
  Tooltip,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Event,
  Schedule,
  Group,
  SportsSoccer,
  SwapHoriz,
  EmojiEvents,
  Timer,
  Flag,
  Lock as LockIcon
} from '@mui/icons-material';
import axios from 'axios';
import SideMenu from './SideMenu';
import AppNavbar from './AppNavBar';
import Header from './Header';

// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://matchgen-backend-production.up.railway.app/api/'
  : 'http://localhost:8000/api/';

// Post type definitions
const POST_TYPES = [
  { 
    id: 'matchday', 
    label: 'Matchday', 
    icon: <Event />, 
    description: 'Pre-match announcement with fixture details',
    featureCode: 'post.matchday'
  },
  { 
    id: 'upcomingFixture', 
    label: 'Upcoming Fixture', 
    icon: <Schedule />, 
    description: 'Future fixture announcement',
    featureCode: 'post.upcoming'
  },
  { 
    id: 'startingXI', 
    label: 'Starting XI', 
    icon: <Group />, 
    description: 'Team lineup announcement',
    featureCode: 'post.startingxi'
  },
  { 
    id: 'goal', 
    label: 'Goal', 
    icon: <SportsSoccer />, 
    description: 'Goal celebration post',
    featureCode: 'post.goal'
  },
  { 
    id: 'sub', 
    label: 'Substitution', 
    icon: <SwapHoriz />, 
    description: 'Player substitution announcement',
    featureCode: 'post.substitution'
  },
  { 
    id: 'player', 
    label: 'Player of the Match', 
    icon: <EmojiEvents />, 
    description: 'Man of the match announcement',
    featureCode: 'post.potm'
  },
  { 
    id: 'halftime', 
    label: 'Half Time', 
    icon: <Timer />, 
    description: 'Half-time score update',
    featureCode: 'post.halftime'
  },
  { 
    id: 'fulltime', 
    label: 'Full Time',
    icon: <Flag />, 
    description: 'Final result announcement',
    featureCode: 'post.fulltime'
  }
];

const SocialMediaPostGenerator = () => {
  const { fixtureId, postType } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostType, setSelectedPostType] = useState(postType || 'matchday');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Feature access state
  const [featureAccess, setFeatureAccess] = useState({});
  const [accessLoading, setAccessLoading] = useState(true);

  // Fetch feature access data
  const checkFeatureAccess = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const selectedClubId = localStorage.getItem('selectedClubId');
      
      if (!token) {
        setAccessLoading(false);
        return;
      }

      if (!selectedClubId || selectedClubId === 'null') {
        console.warn('No club selected for feature access check');
        setAccessLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}users/feature-access/?club_id=${selectedClubId}&t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setFeatureAccess(response.data.feature_access || {});
      }
    } catch (error) {
      console.error('Error fetching feature access:', error);
      // Set empty feature access on error to prevent UI issues
      setFeatureAccess({});
    } finally {
      setAccessLoading(false);
    }
  };

  useEffect(() => {
    checkFeatureAccess();
  }, []);

  // Helper function to get required plan for a feature
  const getRequiredPlan = (featureCode) => {
    const planMap = {
      'post.goal': 'Prem Gen',
      'post.potm': 'Prem Gen',
      'post.substitution': 'SemiPro Gen',
      'post.halftime': 'SemiPro Gen',
      'post.fulltime': 'SemiPro Gen',
    };
    return planMap[featureCode] || 'SemiPro Gen';
  };

  // Helper function to generate tooltip content
  const getTooltipContent = (postType) => (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {postType.label} requires {getRequiredPlan(postType.featureCode)}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
        {postType.description}
      </Typography>
      <Button
        size="small"
        variant="contained"
        onClick={() => navigate('/subscription')}
        sx={{ mt: 1 }}
      >
        Upgrade Now
      </Button>
    </Box>
  );

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}content/matches/`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.results) {
          setMatches(response.data.results);
          
          // If fixtureId is provided, find and select that match
          if (fixtureId) {
            const match = response.data.results.find(m => m.id === parseInt(fixtureId));
            if (match) {
              setSelectedMatch(match);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching matches. Please try again.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [fixtureId, navigate]);

  const handlePostTypeChange = (event, newValue) => {
    const postTypeObj = POST_TYPES.find(p => p.id === newValue);
    const isRestricted = !featureAccess[postTypeObj.featureCode];
    
    if (isRestricted) {
      const requiredPlan = getRequiredPlan(postTypeObj.featureCode);
      setSnackbar({
        open: true,
        message: `${postTypeObj.label} requires ${requiredPlan} plan. Upgrade to access this feature.`,
        severity: 'warning'
      });
      return; // Don't change the tab
    }
    
    setSelectedPostType(newValue);
    setGeneratedImage(null); // Clear previous generated image
  };

  const generatePost = async () => {
    if (!selectedMatch) {
      setSnackbar({
        open: true,
        message: 'Please select a match first.',
        severity: 'warning'
      });
      return;
    }

    const postTypeObj = POST_TYPES.find(p => p.id === selectedPostType);
    const isRestricted = !featureAccess[postTypeObj.featureCode];
    
    if (isRestricted) {
      const requiredPlan = getRequiredPlan(postTypeObj.featureCode);
      setSnackbar({
        open: true,
        message: `${postTypeObj.label} requires ${requiredPlan} plan. Upgrade to access this feature.`,
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Mock post generation - replace with actual API call
      const mockImage = `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#ffffff" stroke="#000000" stroke-width="2"/>
          <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#000000">${postTypeObj.label}</text>
          <text x="200" y="100" text-anchor="middle" font-family="Arial" font-size="18" fill="#333333">${selectedMatch.opponent}</text>
          <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#666666">${new Date(selectedMatch.date).toLocaleDateString()}</text>
          <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="14" fill="#999999">Generated Post</text>
        </svg>
      `)}`;

      setGeneratedImage(mockImage);
      
      setSnackbar({
        open: true,
        message: 'Post generated successfully!',
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error generating post:', error);
      setSnackbar({
        open: true,
        message: 'Error generating post. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || accessLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Header />
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboard')}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              Social Media Post Generator
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate engaging social media posts for your matches
            </Typography>
          </Box>

          {/* Match Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Select Match
              </Typography>
              <Grid container spacing={2}>
                {matches.map((match) => (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: selectedMatch?.id === match.id ? 2 : 1,
                        borderColor: selectedMatch?.id === match.id ? 'primary.main' : 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover'
                        }
                      }}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {match.home_away === 'HOME' ? 'HOME' : 'AWAY'} vs {match.opponent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {new Date(match.date).toLocaleDateString()} at {match.time_start}
                      </Typography>
                      {match.venue && (
                        <Typography variant="caption" color="text.secondary">
                          {match.venue}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Post Type Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Select Post Type
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={selectedPostType}
                  onChange={handlePostTypeChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {POST_TYPES.map((postType) => {
                    const isRestricted = !featureAccess[postType.featureCode];
                    const isSelected = selectedPostType === postType.id;
                    
                    const tabContent = (
                      <Tab
                        key={postType.id}
                        value={postType.id}
                        label={postType.label}
                        icon={isRestricted ? <LockIcon /> : postType.icon}
                        disabled={isRestricted}
                        sx={{
                          opacity: isRestricted ? 0.6 : 1,
                          color: isRestricted ? '#999999' : isSelected ? 'primary.main' : 'text.primary',
                          '&.Mui-selected': {
                            color: isRestricted ? '#999999' : 'primary.main'
                          }
                        }}
                      />
                    );

                    return isRestricted ? (
                      <Tooltip
                        key={postType.id}
                        title={getTooltipContent(postType)}
                        arrow
                        placement="top"
                      >
                        <span>{tabContent}</span>
                      </Tooltip>
                    ) : tabContent;
                  })}
                </Tabs>
              </Box>
              
              {/* Show upgrade required chips for restricted features */}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {POST_TYPES.filter(postType => !featureAccess[postType.featureCode]).map((postType) => (
                  <Tooltip
                    key={postType.id}
                    title={getTooltipContent(postType)}
                    arrow
                    placement="top"
                  >
                    <Chip
                      label={`${postType.label} - Upgrade Required`}
                      size="small"
                      icon={<LockIcon />}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        color: '#999999',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {(() => {
                  const postTypeObj = POST_TYPES.find(p => p.id === selectedPostType);
                  const isRestricted = !featureAccess[postTypeObj.featureCode];
                 
                  const button = (
                    <Button
                      variant="contained"
                      size="large"
                      disabled={!selectedMatch || isRestricted}
                      startIcon={isRestricted ? <LockIcon /> : <SportsSoccer />}
                      onClick={generatePost}
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {isRestricted ? 'Upgrade Required' : 'Generate Post'}
                    </Button>
                  );

                  return isRestricted ? (
                    <Tooltip
                      title={getTooltipContent(postTypeObj)}
                      arrow
                      placement="top"
                    >
                      <span>{button}</span>
                    </Tooltip>
                  ) : button;
                })()}
              </Box>
              
              {!selectedMatch && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Please select a match to generate a post
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Generated Image Display */}
          {generatedImage && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Generated Post
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    component="img"
                    src={generatedImage}
                    alt="Generated post"
                    sx={{
                      maxWidth: '100%',
                      height: 'auto',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

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
        </Container>
      </Box>
    </Box>
  );
};

export default SocialMediaPostGenerator;