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
  },
  { 
    id: 'substitution', 
    label: 'Substitution Post', 
    icon: <SwapHoriz />, 
    description: 'Player substitution announcement post',
    featureCode: 'post.substitution'
  },
  { 
    id: 'score', 
    label: 'Score Update', 
    icon: <SportsSoccer />, 
    description: 'Live score update post',
    featureCode: 'post.score'
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
  const [generatedPost, setGeneratedPost] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Feature access state
  const [featureAccess, setFeatureAccess] = useState({});
  const [accessLoading, setAccessLoading] = useState(true);
  const [userSubscriptionTier, setUserSubscriptionTier] = useState('basic');

  // Fetch feature access data
  const checkFeatureAccess = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setAccessLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}users/feature-access/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setFeatureAccess(response.data.feature_access || {});
        setUserSubscriptionTier(response.data.subscription_tier || 'basic');
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
      'post.score': 'SemiPro Gen',
    };
    return planMap[featureCode] || 'SemiPro Gen';
  };

  // Helper function to check if user has access to a feature based on subscription tier
  const hasFeatureAccess = (featureCode) => {
    const tierAccess = {
      'basic': ['post.matchday', 'post.upcoming', 'post.startingxi'],
      'semipro': ['post.matchday', 'post.upcoming', 'post.startingxi', 'post.substitution', 'post.halftime', 'post.fulltime', 'post.score'],
      'prem': ['post.matchday', 'post.upcoming', 'post.startingxi', 'post.substitution', 'post.halftime', 'post.fulltime', 'post.goal', 'post.potm', 'post.score']
    };
    
    return tierAccess[userSubscriptionTier]?.includes(featureCode) || false;
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

        // If fixtureId is provided, fetch only that specific match
        if (fixtureId) {
          const response = await axios.get(`${API_BASE_URL}content/matches/${fixtureId}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data) {
            setSelectedMatch(response.data);
          }
        } else {
          // If no fixtureId, fetch all matches (fallback)
          const response = await axios.get(`${API_BASE_URL}content/matches/`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data && response.data.results) {
            setMatches(response.data.results);
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
        setSnackbar({
          open: true,
          message: 'Error fetching match. Please try again.',
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
    const isRestricted = !hasFeatureAccess(postTypeObj.featureCode);
    
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
    setGeneratedPost(null);
    setPreviewImage(null);
  };

  // Download functionality
  const downloadPost = () => {
    if (generatedPost) {
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(generatedPost, null, 2)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `${selectedPostType}_${selectedMatch?.opponent}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const downloadImage = () => {
    if (previewImage) {
      const element = document.createElement('a');
      element.href = previewImage;
      element.download = `${selectedPostType}_${selectedMatch?.opponent}_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Generate post function
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
    const isRestricted = !hasFeatureAccess(postTypeObj.featureCode);
    
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
      const mockPost = {
        id: Date.now(),
        type: selectedPostType,
        match: selectedMatch,
        content: `Generated ${postTypeObj.label} post for ${selectedMatch.opponent}`,
        timestamp: new Date().toISOString(),
        metadata: {
          postType: postTypeObj.label,
          opponent: selectedMatch.opponent,
          date: selectedMatch.date,
          venue: selectedMatch.venue
        }
      };

      // Mock preview image generation
      const mockPreviewImage = `data:image/svg+xml;base64,${btoa(`
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="400" height="400" fill="#ffffff" stroke="#000000" stroke-width="2"/>
          <text x="200" y="50" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#000000">${postTypeObj.label}</text>
          <text x="200" y="100" text-anchor="middle" font-family="Arial" font-size="18" fill="#333333">${selectedMatch.opponent}</text>
          <text x="200" y="150" text-anchor="middle" font-family="Arial" font-size="16" fill="#666666">${new Date(selectedMatch.date).toLocaleDateString()}</text>
          <text x="200" y="200" text-anchor="middle" font-family="Arial" font-size="14" fill="#999999">Generated Post Preview</text>
        </svg>
      `)}`;

      setGeneratedPost(mockPost);
      setPreviewImage(mockPreviewImage);
      
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
                     const isRestricted = !hasFeatureAccess(postType.featureCode);
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

           {/* Selected Match Display */}
           {selectedMatch && (
             <Card sx={{ mb: 3 }}>
               <CardContent>
                 <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                   Selected Match
                 </Typography>
                 <Paper
                   sx={{
                     p: 3,
                     backgroundColor: '#fafafa',
                     border: '1px solid #e0e0e0',
                     borderRadius: 2
                   }}
                 >
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <Box>
                       <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                         {selectedMatch.home_away === 'HOME' ? 'HOME' : 'AWAY'} vs {selectedMatch.opponent}
                       </Typography>
                       <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                         {new Date(selectedMatch.date).toLocaleDateString('en-GB', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                         })} at {selectedMatch.time_start}
                       </Typography>
                       {selectedMatch.venue && (
                         <Typography variant="body2" color="text.secondary">
                           📍 {selectedMatch.venue}
                         </Typography>
                       )}
                     </Box>
                     {selectedMatch.opponent_logo && (
                       <Box
                         component="img"
                         src={selectedMatch.opponent_logo}
                         alt={`${selectedMatch.opponent} logo`}
                         sx={{ width: 80, height: 80, ml: 2 }}
                       />
                     )}
                   </Box>
                 </Paper>
               </CardContent>
             </Card>
           )}

          {/* Generate Button */}
          <Card>
            <CardContent>
               <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                 {(() => {
                   const postTypeObj = POST_TYPES.find(p => p.id === selectedPostType);
                   const isRestricted = !hasFeatureAccess(postTypeObj.featureCode);
                  
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

          {/* Preview and Download Section */}
          {(generatedPost || previewImage) && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Generated Post Preview
                </Typography>
                
                {/* Preview Image */}
                {previewImage && (
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Post Preview
                    </Typography>
                    <Box
                      component="img"
                      src={previewImage}
                      alt="Generated post preview"
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                  </Box>
                )}

                {/* Generated Post Content */}
                {generatedPost && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                      Post Content
                    </Typography>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Type:</strong> {generatedPost.metadata.postType}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Opponent:</strong> {generatedPost.metadata.opponent}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Date:</strong> {new Date(generatedPost.metadata.date).toLocaleDateString()}
                      </Typography>
                      {generatedPost.metadata.venue && (
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Venue:</strong> {generatedPost.metadata.venue}
                        </Typography>
                      )}
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Content:</strong> {generatedPost.content}
                      </Typography>
                    </Paper>
                  </Box>
                )}

                {/* Download Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {previewImage && (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={downloadImage}
                      sx={{
                        borderColor: '#000000',
                        color: '#000000',
                        '&:hover': {
                          borderColor: '#333333',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      Download Image
                    </Button>
                  )}
                  
                  {generatedPost && (
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={downloadPost}
                      sx={{
                        borderColor: '#000000',
                        color: '#000000',
                        '&:hover': {
                          borderColor: '#333333',
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      Download Post Data
                    </Button>
                  )}
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
