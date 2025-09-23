import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Snackbar,
  Tab,
  Divider,
  CssBaseline,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Event,
  Schedule,
  Group,
  SportsSoccer,
  SwapHoriz,
  EmojiEvents,
  Timer,
  Flag,
  Lock as LockIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';
import axios from 'axios';
// Theme is now applied globally in main.jsx
import SideMenu from './SideMenu';
import AppNavbar from './AppNavBar';
import Header from './Header';
import FeatureGate from './FeatureGate';
import useFeatureAccess from '../hooks/useFeatureAccess';

// API Configuration - same as apiClient
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://matchgen-backend-production.up.railway.app/api/'
  : 'http://localhost:8000/api/';

// Post type definitions - Monochrome theme
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
  const { fixtureId, postType } = useParams(); // Get fixture ID and post type from URL
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
      const token = localStorage.getItem('token');
      if (!token) {
        setAccessLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}users/feature-access/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setFeatureAccess(response.data.feature_access || {});
      }
    } catch (error) {
      console.error('Error fetching feature access:', error);
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
        const token = localStorage.getItem('token');
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

  if (loading || accessLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box sx={{ flexGrow: 1 }}>
        <AppNavbar />
        <Header title="Social Media Post Generator" />
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
              Create professional social media posts for your club
            </Typography>
          </Box>

          {/* Post Type Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Select Post Type
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {POST_TYPES.map((postType) => {
                    const isRestricted = !featureAccess[postType.featureCode];
                    const isSelected = selectedPostType === postType.id;
                    
                    const tabContent = (
                      <Tab
                        key={postType.id}
                        value={postType.id}
                        disabled={isRestricted}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%' }}>
                            <Box sx={{ mr: 1, color: isRestricted ? '#cccccc' : '#000000' }}>
                              {isRestricted ? <LockIcon /> : postType.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    color: isRestricted ? '#999999' : '#000000'
                                  }}
                                >
                                  {postType.label}
                                </Typography>
                                {isRestricted && (
                                  <Chip 
                                    label="Upgrade Required" 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      height: 20,
                                      backgroundColor: '#f5f5f5',
                                      color: '#666666',
                                      border: '1px solid #cccccc'
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography 
                                variant="caption" 
                                sx={{ color: isRestricted ? '#999999' : '#666666' }}
                              >
                                {postType.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ 
                          alignItems: 'flex-start',
                          minHeight: 60,
                          opacity: isRestricted ? 0.6 : 1,
                          '&.Mui-selected': {
                            backgroundColor: isRestricted ? '#f5f5f5' : '#f5f5f5',
                            color: isRestricted ? '#999999' : '#000000'
                          },
                          '&.Mui-disabled': {
                            opacity: 0.6
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
                </Box>
              </Box>
            </CardContent>
          </Card>

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
                      sx={{
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        backgroundColor: isRestricted ? '#cccccc' : '#000000',
                        color: isRestricted ? '#999999' : '#ffffff',
                        '&:hover': {
                          backgroundColor: isRestricted ? '#cccccc' : '#333333',
                        },
                        '&:disabled': {
                          backgroundColor: '#cccccc',
                          color: '#999999',
                        },
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



