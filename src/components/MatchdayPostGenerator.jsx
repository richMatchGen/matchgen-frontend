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
  Divider,
  Container,
  CssBaseline,
  Tooltip
} from '@mui/material';
import {
  Download,
  Image,
  Schedule,
  LocationOn,
  Add,
  Delete,
  SportsSoccer,
  CheckCircle,
  ArrowBack,
  Group,
  Event,
  EmojiEvents,
  SwapHoriz,
  Person,
  Timer,
  Flag,
  Lock as LockIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppTheme from '../themes/AppTheme';
import SideMenu from './SideMenu';
import AppNavbar from './AppNavBar';
import Header from './Header';
import FeatureGate from './FeatureGate';
import useFeatureAccess from '../hooks/useFeatureAccess';
import EmailVerificationBanner from './EmailVerificationBanner';

import env from '../config/environment';
// API Configuration - same as apiClient
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '${env.API_BASE_URL}/'
  : 'http://localhost:8000/api/';

// Post type definitions
const POST_TYPES = [
  { 
    id: 'matchday', 
    label: 'Matchday', 
    icon: <Event />, 
    description: 'Pre-match announcement with fixture details',
    color: 'primary',
    featureCode: 'post.matchday'
  },
  { 
    id: 'upcomingFixture', 
    label: 'Upcoming Fixture', 
    icon: <Schedule />, 
    description: 'Future fixture announcement',
    color: 'info',
    featureCode: 'post.upcoming'
  },
  { 
    id: 'startingXI', 
    label: 'Starting XI', 
    icon: <Group />, 
    description: 'Team lineup announcement',
    color: 'success',
    featureCode: 'post.startingxi'
  },
  { 
    id: 'goal', 
    label: 'Goal', 
    icon: <SportsSoccer />, 
    description: 'Goal celebration post',
    color: 'warning',
    featureCode: 'post.goal'
  },
  { 
    id: 'sub', 
    label: 'Substitution', 
    icon: <SwapHoriz />, 
    description: 'Player substitution announcement',
    color: 'secondary',
    featureCode: 'post.substitution'
  },
  { 
    id: 'player', 
    label: 'Player of the Match', 
    icon: <EmojiEvents />, 
    description: 'Man of the match announcement',
    color: 'warning',
    featureCode: 'post.potm'
  },
  { 
    id: 'halftime', 
    label: 'Half Time', 
    icon: <Timer />, 
    description: 'Half-time score update',
    color: 'info',
    featureCode: 'post.halftime'
  },
  { 
    id: 'fulltime', 
    label: 'Full Time',
    icon: <Flag />, 
    description: 'Final result announcement',
    color: 'success',
    featureCode: 'post.fulltime'
  }
];

const SocialMediaPostGenerator = () => {
  const { fixtureId, postType } = useParams(); // Get fixture ID and post type from URL
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(fixtureId || '');
  const [selectedPostType, setSelectedPostType] = useState(postType || 'matchday');
  
  // Debug logging
  console.log('🔍 URL fixtureId:', fixtureId, 'type:', typeof fixtureId);
  console.log('🔍 selectedMatch:', selectedMatch, 'type:', typeof selectedMatch);
  console.log('🔍 !fixtureId condition:', !fixtureId);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [debugData, setDebugData] = useState(null);
  
  // Substitution-specific state
  const [playerOn, setPlayerOn] = useState('');
  const [playerOff, setPlayerOff] = useState('');
  const [minute, setMinute] = useState('');
  const [players, setPlayers] = useState([]);
  
  // Goal-specific state
  const [goalScorer, setGoalScorer] = useState('');
  const [goalMinute, setGoalMinute] = useState('');
  
  // New flexible substitution state
  const [playersOn, setPlayersOn] = useState([]);
  const [playersOff, setPlayersOff] = useState([]);
  
  // Multiple substitutions state (legacy - keeping for backward compatibility)
  const [substitutions, setSubstitutions] = useState([]);
  
  // Functions to handle multiple substitutions (now using multi-select approach)
  
  // Score-specific state
  const [homeScoreHt, setHomeScoreHt] = useState('0');
  const [awayScoreHt, setAwayScoreHt] = useState('0');
  const [homeScoreFt, setHomeScoreFt] = useState('0');
  const [awayScoreFt, setAwayScoreFt] = useState('0');
  
  // Starting XI state
  const [startingLineup, setStartingLineup] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  
  // Feature access state
  const [featureAccess, setFeatureAccess] = useState({});
  const [accessLoading, setAccessLoading] = useState(true);
  
  // User state for verification check
  const [user, setUser] = useState(null);

  // Fetch matches and players on component mount
  useEffect(() => {
    fetchMatches();
    fetchPlayers();
    checkFeatureAccess();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await axios.get(
          `${API_BASE_URL}users/me/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        '${env.API_BASE_URL}/content/matches/',
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

  const fetchPlayers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        '${env.API_BASE_URL}/content/players/substitution/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlayers(response.data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      // Don't set error here as it's not critical for the main functionality
    }
  };

  const checkFeatureAccess = async () => {
    try {
      setAccessLoading(true);
      const token = localStorage.getItem('accessToken');
      const clubId = localStorage.getItem('selectedClubId');
      
      if (token && clubId) {
        const response = await axios.get(
          `${API_BASE_URL}users/feature-access/?club_id=${clubId}&t=${Date.now()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const { feature_access } = response.data;
        setFeatureAccess(feature_access || {});
      } else {
        // Default to no access if no club ID
        setFeatureAccess({});
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      setFeatureAccess({});
    } finally {
      setAccessLoading(false);
    }
  };

  const getRequiredPlan = (featureCode) => {
    const planMapping = {
      'post.substitution': 'SemiPro Gen',
      'post.halftime': 'SemiPro Gen',
      'post.fulltime': 'SemiPro Gen',
      'post.goal': 'Prem Gen',
      'post.potm': 'Prem Gen'
    };
    return planMapping[featureCode] || 'Higher Plan';
  };

  const getTooltipContent = (postType) => {
    const requiredPlan = getRequiredPlan(postType.featureCode);
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          {postType.label} requires {requiredPlan}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
          {postType.description}
        </Typography>
        <Button
          size="small"
          variant="contained"
          startIcon={<UpgradeIcon />}
          onClick={() => navigate('/subscription')}
          sx={{ mt: 1 }}
        >
          Upgrade Now
        </Button>
      </Box>
    );
  };

  const generatePost = async () => {
    // Check if user is verified
    if (!user?.email_verified) {
      setSnackbar({
        open: true,
        message: 'Please verify your email address before creating posts. Check the banner above for verification options.',
        severity: 'warning'
      });
      return;
    }

    if (!selectedMatch) {
      setSnackbar({
        open: true,
        message: 'Please select a fixture first',
        severity: 'warning'
      });
      return;
    }

    // Check feature access before generating
    const currentPostType = POST_TYPES.find(pt => pt.id === selectedPostType);
    if (currentPostType && currentPostType.featureCode) {
      const hasAccess = featureAccess[currentPostType.featureCode] || false;
      if (!hasAccess) {
        const requiredPlan = getRequiredPlan(currentPostType.featureCode);
        setSnackbar({
          open: true,
          message: `${currentPostType.label} requires ${requiredPlan}. Click here to upgrade.`,
          severity: 'warning',
          action: (
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/subscription')}
              startIcon={<UpgradeIcon />}
            >
              Upgrade
            </Button>
          )
        });
        return;
      }
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
      
      // Prepare request data
      const requestData = { match_id: selectedMatch };
      
      // Add substitution-specific data if post type is 'sub'
      if (selectedPostType === 'sub') {
        // Use new flexible substitution format
        if (playersOn.length > 0 || playersOff.length > 0) {
          requestData.players_on = playersOn;
          requestData.players_off = playersOff;
          requestData.minute = minute || 'Minute';
        } else {
          // Fallback to single substitution format for backward compatibility
          requestData.player_on = playerOn || 'Player On';
          requestData.player_off = playerOff || 'Player Off';
          requestData.minute = minute || 'Minute';
        }
      }
      
      // Add halftime score data if post type is 'halftime'
      if (selectedPostType === 'halftime') {
        requestData.home_score_ht = homeScoreHt || '0';
        requestData.away_score_ht = awayScoreHt || '0';
      }
      
      // Add fulltime score data if post type is 'fulltime'
      if (selectedPostType === 'fulltime') {
        requestData.home_score_ft = homeScoreFt || '0';
        requestData.away_score_ft = awayScoreFt || '0';
      }
      
      // Add starting XI data if post type is 'startingXI'
      if (selectedPostType === 'startingXI') {
        requestData.starting_lineup = startingLineup || [];
        requestData.substitutes = substitutes || [];
      }
      
      // Add goal data if post type is 'goal'
      if (selectedPostType === 'goal') {
        requestData.goal_scorer = goalScorer || 'Player Name';
        requestData.goal_minute = goalMinute || 'Minute';
      }
      
      const response = await axios.post(
        `https://matchgen-backend-production.up.railway.app${endpoint}`,
        requestData,
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
    console.log('🔍 getSelectedMatchData - selectedMatch:', selectedMatch, 'type:', typeof selectedMatch);
    console.log('🔍 matches:', matches);
    const match = matches.find(match => match.id === parseInt(selectedMatch));
    console.log('🔍 found match:', match);
    return match;
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

  const handlePostTypeChange = async (event, newValue) => {
    // Check if user has access to this feature using cached data
    const postType = POST_TYPES.find(pt => pt.id === newValue);
    if (postType && postType.featureCode) {
      const hasAccess = featureAccess[postType.featureCode] || false;
      if (!hasAccess) {
        const requiredPlan = getRequiredPlan(postType.featureCode);
        // Show upgrade message with link
        setSnackbar({
          open: true,
          message: `${postType.label} requires ${requiredPlan}. Click here to upgrade.`,
          severity: 'warning',
          action: (
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/subscription')}
              startIcon={<UpgradeIcon />}
            >
              Upgrade
            </Button>
          )
        });
        return; // Don't change the tab
      }
    }
    
    setSelectedPostType(newValue);
    setGeneratedImage(null); // Clear previous generated image
  };

  if (loading || accessLoading) {
    return (
      <AppTheme>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: 'flex', overflow: 'hidden' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1, overflow: 'hidden', minWidth: 0 }}>
          <AppNavbar />
           <Header title="Social Media Post Generator" />
           
           <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
             <EmailVerificationBanner 
               user={user} 
               onVerificationComplete={() => {
                 // Refresh user data after verification
                 fetchUserData();
               }}
             />
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

            <Grid container spacing={3} sx={{ overflow: 'hidden' }}>
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
                      {POST_TYPES.map((postType) => {
                        const hasAccess = featureAccess[postType.featureCode] || false;
                        const isRestricted = !hasAccess;
                        
                        const tabContent = (
                          <Tab
                            key={postType.id}
                            value={postType.id}
                            disabled={isRestricted}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%' }}>
                                <Box sx={{ mr: 1, color: isRestricted ? 'text.disabled' : `${postType.color}.main` }}>
                                  {isRestricted ? <LockIcon /> : postType.icon}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        color: isRestricted ? 'text.disabled' : 'inherit'
                                      }}
                                    >
                                      {postType.label}
                                    </Typography>
                                    {isRestricted && (
                                      <Chip 
                                        label="Upgrade Required" 
                                        size="small" 
                                        color="warning" 
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    )}
                                  </Box>
                                  <Typography 
                                    variant="caption" 
                                    color={isRestricted ? 'text.disabled' : 'text.secondary'}
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
                                backgroundColor: isRestricted ? 'grey.100' : `${postType.color}.50`,
                                color: isRestricted ? 'text.disabled' : `${postType.color}.main`
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
                            placement="right"
                            arrow
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  maxWidth: 300,
                                  '& .MuiTooltip-arrow': {
                                    color: 'primary.main',
                                  },
                                },
                              },
                            }}
                          >
                            <span>{tabContent}</span>
                          </Tooltip>
                        ) : tabContent;
                      })}
                    </Tabs>
                  </CardContent>
                </Card>
              </Grid>

              {/* Center Panel - Fixture Selection & Details */}
              <Grid item xs={12} md={4}>
                <Card>
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

                    {/* Substitution Form - Only show for substitution posts */}
                    {selectedPostType === 'sub' && (
                      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'blue.50' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Substitution Details
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                          gap: 3 
                        }}>
                          {/* Players Coming On */}
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Players Coming On
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                multiple
                                value={playersOn}
                                onChange={(e) => setPlayersOn(e.target.value)}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                      <Chip key={value} label={value} size="small" color="success" />
                                    ))}
                                  </Box>
                                )}
                              >
                                {players.map((player) => (
                                  <MenuItem key={player.id} value={player.name}>
                                    {player.name} ({player.squad_no}) - {player.position}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {playersOn.length} players coming on selected
                            </Typography>
                          </Box>

                          {/* Players Going Off */}
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Players Going Off
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                multiple
                                value={playersOff}
                                onChange={(e) => setPlayersOff(e.target.value)}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                      <Chip key={value} label={value} size="small" color="error" />
                                    ))}
                                  </Box>
                                )}
                              >
                                {players.map((player) => (
                                  <MenuItem key={player.id} value={player.name}>
                                    {player.name} ({player.squad_no}) - {player.position}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {playersOff.length} players going off selected
                            </Typography>
                          </Box>
                        </Box>

                        {/* Single minute field */}
                        <Box sx={{ mb: 3, mt: 3 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Substitution Minute
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={minute}
                              onChange={(e) => setMinute(e.target.value)}
                              label="Minute"
                            >
                              {Array.from({ length: 90 }, (_, i) => i + 1).map((min) => (
                                <MenuItem key={min} value={min.toString()}>
                                  {min}'
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        {/* Preview of substitutions */}
                        {(playersOn.length > 0 || playersOff.length > 0) && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              Substitution Preview:
                            </Typography>
                            {playersOff.length > 0 && (
                              <Typography variant="body2" sx={{ mb: 0.5, color: 'error.main' }}>
                                <strong>Going Off:</strong> {playersOff.join(', ')}
                              </Typography>
                            )}
                            {playersOn.length > 0 && (
                              <Typography variant="body2" sx={{ mb: 0.5, color: 'success.main' }}>
                                <strong>Coming On:</strong> {playersOn.join(', ')}
                              </Typography>
                            )}
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Minute:</strong> {minute || 'Not selected'}'
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    )}

                    {/* Goal Form - Only show for goal posts */}
                    {selectedPostType === 'goal' && (
                      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'yellow.50' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Goal Details
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                          gap: 3 
                        }}>
                          {/* Goal Scorer */}
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Goal Scorer
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                value={goalScorer}
                                onChange={(e) => setGoalScorer(e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">
                                  <em>Select Goal Scorer</em>
                                </MenuItem>
                                {players.map((player) => (
                                  <MenuItem key={player.id} value={player.name}>
                                    {player.name} ({player.squad_no}) - {player.position}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Select the player who scored the goal
                            </Typography>
                          </Box>

                          {/* Goal Minute */}
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Goal Minute
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                value={goalMinute}
                                onChange={(e) => setGoalMinute(e.target.value)}
                                displayEmpty
                              >
                                <MenuItem value="">
                                  <em>Select Minute</em>
                                </MenuItem>
                                {Array.from({ length: 90 }, (_, i) => i + 1).map((min) => (
                                  <MenuItem key={min} value={min.toString()}>
                                    {min}'
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Select the minute when the goal was scored
                            </Typography>
                          </Box>
                        </Box>

                        {/* Preview of goal */}
                        {(goalScorer || goalMinute) && (
                          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                              Goal Preview:
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 0.5, color: 'success.main' }}>
                              <strong>Goal Scorer:</strong> {goalScorer || 'Not selected'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              <strong>Minute:</strong> {goalMinute || 'Not selected'}'
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    )}

                    {/* Halftime Score Form - Only show for halftime posts */}
                    {selectedPostType === 'halftime' && (
                      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'orange.50' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Half Time Score
                        </Typography>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Home Team Score</InputLabel>
                            <Select
                              value={homeScoreHt}
                              onChange={(e) => setHomeScoreHt(e.target.value)}
                              label="Home Team Score"
                            >
                              {Array.from({ length: 21 }, (_, i) => i).map((score) => (
                                <MenuItem key={score} value={score.toString()}>
                                  {score}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth>
                            <InputLabel>Away Team Score</InputLabel>
                            <Select
                              value={awayScoreHt}
                              onChange={(e) => setAwayScoreHt(e.target.value)}
                              label="Away Team Score"
                            >
                              {Array.from({ length: 21 }, (_, i) => i).map((score) => (
                                <MenuItem key={score} value={score.toString()}>
                                  {score}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Paper>
                    )}

                    {/* Fulltime Score Form - Only show for fulltime posts */}
                    {selectedPostType === 'fulltime' && (
                      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'green.50' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Full Time Score
                        </Typography>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                          <FormControl fullWidth>
                            <InputLabel>Home Team Score</InputLabel>
                            <Select
                              value={homeScoreFt}
                              onChange={(e) => setHomeScoreFt(e.target.value)}
                              label="Home Team Score"
                            >
                              {Array.from({ length: 21 }, (_, i) => i).map((score) => (
                                <MenuItem key={score} value={score.toString()}>
                                  {score}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth>
                            <InputLabel>Away Team Score</InputLabel>
                            <Select
                              value={awayScoreFt}
                              onChange={(e) => setAwayScoreFt(e.target.value)}
                              label="Away Team Score"
                            >
                              {Array.from({ length: 21 }, (_, i) => i).map((score) => (
                                <MenuItem key={score} value={score.toString()}>
                                  {score}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Paper>
                    )}

                    {/* Starting XI Form - Only show for starting XI posts */}
                    {selectedPostType === 'startingXI' && (
                      <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'purple.50' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Starting XI & Substitutes
                        </Typography>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                          {/* Starting Lineup */}
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Starting Lineup (Selected {startingLineup.length} players)
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                multiple
                                value={startingLineup}
                                onChange={(e) => {
                                  const selected = e.target.value;
                                  // Limit to 11 players
                                  if (selected.length <= 11) {
                                    setStartingLineup(selected);
                                  }
                                }}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                      <Chip key={value} label={value} size="small" />
                                    ))}
                                  </Box>
                                )}
                              >
                                {players
                                  .filter(player => !substitutes.includes(player.name))
                                  .map((player) => (
                                    <MenuItem key={player.id} value={player.name}>
                                      {player.name} ({player.squad_no}) - {player.position}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {/* {startingLineup.length}/11 players selected */}
                            </Typography>
                          </Box>

                          {/* Substitutes */}
                          <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                              Substitutes (Selected {substitutes.length} players)
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                multiple
                                value={substitutes}
                                onChange={(e) => {
                                  const selected = e.target.value;
                                  // Limit to 7 substitutes
                                  if (selected.length <= 7) {
                                    setSubstitutes(selected);
                                  }
                                }}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                      <Chip key={value} label={value} size="small" />
                                    ))}
                                  </Box>
                                )}
                              >
                                {players
                                  .filter(player => !startingLineup.includes(player.name))
                                  .map((player) => (
                                    <MenuItem key={player.id} value={player.name}>
                                      {player.name} ({player.squad_no}) - {player.position}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              {/* {substitutes.length}/7 substitutes selected */}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )}

                     {(() => {
                       const currentPostType = POST_TYPES.find(pt => pt.id === selectedPostType);
                       const hasAccess = currentPostType ? featureAccess[currentPostType.featureCode] || false : true;
                       const isRestricted = !hasAccess;
                       const isUnverified = !user?.email_verified;
                       
                       const buttonContent = (
                         <Button
                           variant="contained"
                           fullWidth
                           size="large"
                           onClick={generatePost}
                           disabled={!selectedMatch || generating || isRestricted || isUnverified}
                           startIcon={
                             generating ? <CircularProgress size={20} /> : 
                             isUnverified ? <LockIcon /> :
                             isRestricted ? <LockIcon /> : 
                             <Image />
                           }
                           sx={{ 
                             py: 1.5,
                             fontWeight: 'bold',
                             fontSize: '1.1rem',
                             opacity: (isRestricted || isUnverified) ? 0.6 : 1
                           }}
                         >
                           {generating ? 'Generating...' : 
                            isUnverified ? 'Email Verification Required' :
                            isRestricted ? 'Upgrade Required' :
                            `Generate ${currentPostType?.label} Post`}
                         </Button>
                       );

                      if (isUnverified) {
                        return (
                          <Tooltip
                            title="Please verify your email address to create posts. Check the banner above for verification options."
                            placement="top"
                            arrow
                          >
                            <span>{buttonContent}</span>
                          </Tooltip>
                        );
                      }

                      return isRestricted && currentPostType ? (
                        <Tooltip
                          title={getTooltipContent(currentPostType)}
                          placement="top"
                          arrow
                          componentsProps={{
                            tooltip: {
                              sx: {
                                maxWidth: 300,
                                '& .MuiTooltip-arrow': {
                                  color: 'primary.main',
                                },
                              },
                            },
                          }}
                        >
                          <span>{buttonContent}</span>
                        </Tooltip>
                      ) : buttonContent;
                    })()}
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
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default SocialMediaPostGenerator;