import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useClubSingleton from "../hooks/useClubSingleton";
import { getMatches } from "../api/config";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Paper,
  Box,
  CssBaseline,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Badge
} from "@mui/material";
import {
  SportsSoccer,
  Today,
  Schedule,
  EmojiEvents,
  AccessTime,
  CheckCircle,
  Visibility,
  Download,
  Share,
  Refresh,
  ExpandMore,
  Add,
  Remove,
  PlayArrow,
  Stop,
  Settings,
  Palette,
  PostAdd,
  BatchPrediction,
  PersonAdd,
  SwapHoriz,
  Score,
  Flag,
  Timer
} from '@mui/icons-material';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

// Post type configurations
const POST_TYPES = [
  { 
    id: 'matchday', 
    label: 'Matchday Post', 
    icon: <SportsSoccer />, 
    color: 'primary',
    description: 'Pre-match announcement and excitement',
    requiresData: false
  },
  { 
    id: 'startingxi', 
    label: 'Starting XI', 
    icon: <PersonAdd />, 
    color: 'secondary',
    description: 'Team lineup announcement',
    requiresData: false
  },
  { 
    id: 'upcoming', 
    label: 'Upcoming Fixture', 
    icon: <Schedule />, 
    color: 'info',
    description: 'Next match preview',
    requiresData: false
  },
  { 
    id: 'goal', 
    label: 'Goal Celebration', 
    icon: <EmojiEvents />, 
    color: 'success',
    description: 'Goal scorer celebration',
    requiresData: true,
    dataFields: ['scorer_name', 'minute', 'assist_name']
  },
  { 
    id: 'substitution', 
    label: 'Substitution', 
    icon: <SwapHoriz />, 
    color: 'warning',
    description: 'Player substitution update',
    requiresData: true,
    dataFields: ['player_in', 'player_out', 'minute']
  },
  { 
    id: 'halftime', 
    label: 'Halftime Score', 
    icon: <Timer />, 
    color: 'info',
    description: 'Half-time score update',
    requiresData: true,
    dataFields: ['home_score', 'away_score']
  },
  { 
    id: 'fulltime', 
    label: 'Full-time Result', 
    icon: <Flag />, 
    color: 'error',
    description: 'Final match result',
    requiresData: true,
    dataFields: ['home_score', 'away_score', 'highlights']
  }
];

const GenPosts = () => {
  const navigate = useNavigate();
  const { matchId: urlMatchId } = useParams();
  const { logout } = useAuth();
  const { club } = useClubSingleton();
  
  // State management
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [graphicPacks, setGraphicPacks] = useState([]);
  const [selectedGraphicPack, setSelectedGraphicPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingPosts, setGeneratingPosts] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [selectedPostTypes, setSelectedPostTypes] = useState(new Set());
  const [customData, setCustomData] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [showDataDialog, setShowDataDialog] = useState(false);
  const [currentPostType, setCurrentPostType] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Memoized values
  const filteredMatches = useMemo(() => {
    if (!matches.length) return [];
    return matches.filter(match => {
      const today = new Date();
      const matchDate = new Date(match.date);
      const diffDays = Math.ceil((matchDate - today) / (1000 * 60 * 60 * 24));
      
      switch (activeTab) {
        case 0: return true; // All
        case 1: return diffDays > 0; // Upcoming
        case 2: return diffDays === 0; // Today
        case 3: return diffDays < 0; // Past
        default: return true;
      }
    });
  }, [matches, activeTab]);

  const stats = useMemo(() => {
    const today = new Date();
    return {
      total: matches.length,
      upcoming: matches.filter(m => new Date(m.date) > today).length,
      today: matches.filter(m => {
        const matchDate = new Date(m.date);
        return Math.ceil((matchDate - today) / (1000 * 60 * 60 * 24)) === 0;
      }).length,
      past: matches.filter(m => new Date(m.date) < today).length
    };
  }, [matches]);

  // Data fetching
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const userRes = await axios.get("/api/users/me/", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUser(userRes.data);
    } catch (error) {
      logout();
      return;
    }
  }, [navigate, logout]);

  const fetchMatches = useCallback(async () => {
    try {
      const result = await getMatches();
      if (result.success) {
        let matchesData = [];
        const data = result.data;
        
        if (Array.isArray(data)) {
          matchesData = data;
        } else if (data.results && Array.isArray(data.results)) {
          matchesData = data.results;
        } else if (data.matches && Array.isArray(data.matches)) {
          matchesData = data.matches;
        } else if (typeof data === 'object' && data.id) {
          matchesData = [data];
        }
        
        setMatches(matchesData);
        
        // Set selected match if URL has matchId
        if (urlMatchId) {
          const match = matchesData.find(m => m.id.toString() === urlMatchId);
          if (match) {
            setSelectedMatch(match);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
    }
  }, [urlMatchId]);

  const fetchGraphicPacks = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://matchgen-backend-production.up.railway.app/api/graphicpack/graphic-packs/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data && Array.isArray(response.data)) {
        setGraphicPacks(response.data);
        if (response.data.length > 0) {
          setSelectedGraphicPack(response.data[0]);
        }
      }
    } catch (error) {
      console.warn("Failed to load graphic packs, using fallback");
      // Fallback graphic packs
      setGraphicPacks([
        { id: 1, name: "Default Pack", description: "Standard design" },
        { id: 2, name: "Premium Pack", description: "Enhanced design" }
      ]);
      setSelectedGraphicPack({ id: 1, name: "Default Pack", description: "Standard design" });
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchMatches(),
        fetchGraphicPacks()
      ]);
      setLoading(false);
    };

    initializeData();
  }, [fetchUserData, fetchMatches, fetchGraphicPacks]);

  // Post generation
  const generatePost = useCallback(async (matchId, postType, customData = {}) => {
    if (!matchId || !postType) {
      setSnackbar({ 
        open: true, 
        message: "Missing match ID or post type", 
        severity: "error" 
      });
      return;
    }

    setGeneratingPosts(prev => new Set(prev).add(`${matchId}-${postType}`));

    try {
      const token = localStorage.getItem("accessToken");
      let endpoint = '';
      
      switch (postType) {
        case 'upcoming':
          endpoint = `generate-upcoming/`;
          break;
        case 'matchday':
          endpoint = `generate-matchday/`;
          break;
        case 'startingxi':
          endpoint = `generate-startingxi/`;
          break;
        case 'goal':
          endpoint = `generate-goal/`;
          break;
        case 'substitution':
          endpoint = `generate-substitution/`;
          break;
        case 'halftime':
          endpoint = `generate-halftime/`;
          break;
        case 'fulltime':
          endpoint = `generate-fulltime/`;
          break;
        default:
          throw new Error('Invalid post type');
      }

      const requestData = {
        ...customData,
        graphic_pack_id: selectedGraphicPack?.id
      };

      const response = await axios.post(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/match/${matchId}/${endpoint}`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSnackbar({ 
        open: true, 
        message: `${POST_TYPES.find(pt => pt.id === postType)?.label} generated successfully!`, 
        severity: "success" 
      });

      // Update match with new post URL
      setMatches(prev => prev.map(m => 
        m.id === matchId 
          ? { ...m, [`${postType}_post_url`]: response.data.url }
          : m
      ));

    } catch (error) {
      console.error(`Error generating ${postType} post:`, error);
      
      if (error.response?.status === 429) {
        setRateLimited(true);
        setSnackbar({ 
          open: true, 
          message: "Rate limited. Please wait before generating more posts.", 
          severity: "warning" 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: `Failed to generate ${postType} post.`, 
          severity: "error" 
        });
      }
    } finally {
      setGeneratingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${matchId}-${postType}`);
        return newSet;
      });
    }
  }, [selectedGraphicPack]);

  const generateBatch = useCallback(async () => {
    if (!selectedMatch || selectedPostTypes.size === 0) {
      setSnackbar({ 
        open: true, 
        message: "Please select a match and at least one post type", 
        severity: "warning" 
      });
      return;
    }

    setGenerating(true);
    
    const promises = Array.from(selectedPostTypes).map(postType => {
      const postConfig = POST_TYPES.find(pt => pt.id === postType);
      const data = postConfig?.requiresData ? customData[postType] || {} : {};
      return generatePost(selectedMatch.id, postType, data);
    });

    try {
      await Promise.all(promises);
      setSnackbar({ 
        open: true, 
        message: `Generated ${selectedPostTypes.size} posts successfully!`, 
        severity: "success" 
      });
    } catch (error) {
      console.error("Batch generation error:", error);
    } finally {
      setGenerating(false);
    }
  }, [selectedMatch, selectedPostTypes, customData, generatePost]);

  // Event handlers
  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
    setShowMatchDialog(false);
    navigate(`/gen/posts/${match.id}`);
  };

  const handlePostTypeToggle = (postType) => {
    setSelectedPostTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postType)) {
        newSet.delete(postType);
      } else {
        newSet.add(postType);
      }
      return newSet;
    });
  };

  const handleCustomDataInput = (postType) => {
    setCurrentPostType(postType);
    setShowDataDialog(true);
  };

  const handleCustomDataSave = (data) => {
    setCustomData(prev => ({
      ...prev,
      [currentPostType]: data
    }));
    setShowDataDialog(false);
    setCurrentPostType(null);
  };

  const getMatchStatus = (match) => {
    const today = new Date();
    const matchDate = new Date(match.date);
    const diffTime = matchDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'completed', label: 'Completed', color: 'success' };
    } else if (diffDays === 0) {
      return { status: 'today', label: 'Today', color: 'warning' };
    } else if (diffDays <= 7) {
      return { status: 'upcoming', label: 'Upcoming', color: 'info' };
    } else {
      return { status: 'future', label: 'Future', color: 'default' };
    }
  };

  if (loading) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress size={60} />
        </Box>
      </AppTheme>
    );
  }

  if (!user) return null;

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : theme.palette.background.default,
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <Container sx={{ py: 4, width: '100%' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PostAdd sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      Social Media Posts Generator
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Generate professional social media content for your matches
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowMatchDialog(true)}
                  disabled={generating}
                >
                  Select Match
                </Button>
              </Box>

              {rateLimited && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  You are currently rate limited. Please wait before generating more posts.
                </Alert>
              )}

              {/* Match Selection */}
              {selectedMatch && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                          Selected Match: vs {selectedMatch.opponent}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(selectedMatch.date).toLocaleDateString('en-GB', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} • {selectedMatch.venue}
                        </Typography>
                        <Chip 
                          label={getMatchStatus(selectedMatch).label} 
                          color={getMatchStatus(selectedMatch).color} 
                          size="small" 
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Graphic Pack</InputLabel>
                          <Select
                            value={selectedGraphicPack?.id || ''}
                            onChange={(e) => {
                              const pack = graphicPacks.find(p => p.id === e.target.value);
                              setSelectedGraphicPack(pack);
                            }}
                            label="Graphic Pack"
                          >
                            {graphicPacks.map((pack) => (
                              <MenuItem key={pack.id} value={pack.id}>
                                {pack.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Post Types Selection */}
              {selectedMatch && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Select Post Types
                    </Typography>
                    <Grid container spacing={2}>
                      {POST_TYPES.map((postType) => (
                        <Grid item xs={12} sm={6} md={4} key={postType.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              border: selectedPostTypes.has(postType.id) ? 2 : 1,
                              borderColor: selectedPostTypes.has(postType.id) ? `${postType.color}.main` : 'grey.300',
                              '&:hover': { borderColor: `${postType.color}.main` }
                            }}
                            onClick={() => handlePostTypeToggle(postType.id)}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Box sx={{ color: `${postType.color}.main`, mb: 1 }}>
                                {postType.icon}
                              </Box>
                              <Typography variant="h6" sx={{ mb: 1 }}>
                                {postType.label}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {postType.description}
                              </Typography>
                              <Checkbox 
                                checked={selectedPostTypes.has(postType.id)}
                                color={postType.color}
                              />
                              {postType.requiresData && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCustomDataInput(postType.id);
                                  }}
                                  sx={{ mt: 1 }}
                                >
                                  Add Data
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Generation Actions */}
              {selectedMatch && selectedPostTypes.size > 0 && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generate Posts
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<BatchPrediction />}
                        onClick={generateBatch}
                        disabled={generating || rateLimited}
                        size="large"
                      >
                        {generating ? 'Generating...' : `Generate ${selectedPostTypes.size} Posts`}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={() => {
                          setSelectedPostTypes(new Set());
                          setCustomData({});
                        }}
                        disabled={generating}
                      >
                        Clear Selection
                      </Button>
                    </Stack>
                    {generating && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Generating posts... Please wait.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Match List */}
              {!selectedMatch && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Matches
                    </Typography>
                    
                    {/* Stats */}
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4">{stats.total}</Typography>
                            <Typography variant="body2">Total Matches</Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={3}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="info.main">{stats.upcoming}</Typography>
                            <Typography variant="body2">Upcoming</Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={3}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="warning.main">{stats.today}</Typography>
                            <Typography variant="body2">Today</Typography>
                          </Card>
                        </Grid>
                        <Grid item xs={3}>
                          <Card sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" color="success.main">{stats.past}</Typography>
                            <Typography variant="body2">Completed</Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label={`All (${stats.total})`} />
                        <Tab label={`Upcoming (${stats.upcoming})`} />
                        <Tab label={`Today (${stats.today})`} />
                        <Tab label={`Past (${stats.past})`} />
                      </Tabs>
                    </Box>

                    {/* Match List */}
                    <Grid container spacing={2}>
                      {filteredMatches.map((match) => (
                        <Grid item xs={12} sm={6} md={4} key={match.id}>
                          <Card 
                            sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                            onClick={() => handleMatchSelect(match)}
                          >
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                vs {match.opponent}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {new Date(match.date).toLocaleDateString('en-GB', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {match.venue}
                              </Typography>
                              <Chip 
                                label={getMatchStatus(match).label} 
                                color={getMatchStatus(match).color} 
                                size="small" 
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Dialogs */}
              
              {/* Match Selection Dialog */}
              <Dialog 
                open={showMatchDialog} 
                onClose={() => setShowMatchDialog(false)}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>Select a Match</DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
                    {matches.map((match) => (
                      <Grid item xs={12} sm={6} key={match.id}>
                        <Card 
                          sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                          onClick={() => handleMatchSelect(match)}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              vs {match.opponent}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(match.date).toLocaleDateString()}
                            </Typography>
                            <Chip 
                              label={getMatchStatus(match).label} 
                              color={getMatchStatus(match).color} 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowMatchDialog(false)}>Cancel</Button>
                </DialogActions>
              </Dialog>

              {/* Custom Data Dialog */}
              <Dialog 
                open={showDataDialog} 
                onClose={() => setShowDataDialog(false)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  Add Data for {currentPostType && POST_TYPES.find(pt => pt.id === currentPostType)?.label}
                </DialogTitle>
                <DialogContent>
                  {currentPostType && (() => {
                    const postConfig = POST_TYPES.find(pt => pt.id === currentPostType);
                    if (!postConfig?.dataFields) return null;

                    return (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        {postConfig.dataFields.map((field) => (
                          <TextField
                            key={field}
                            label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            fullWidth
                            value={customData[currentPostType]?.[field] || ''}
                            onChange={(e) => {
                              setCustomData(prev => ({
                                ...prev,
                                [currentPostType]: {
                                  ...prev[currentPostType],
                                  [field]: e.target.value
                                }
                              }));
                            }}
                          />
                        ))}
                      </Stack>
                    );
                  })()}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setShowDataDialog(false)}>Cancel</Button>
                  <Button onClick={() => handleCustomDataSave(customData[currentPostType] || {})}>
                    Save
                  </Button>
                </DialogActions>
              </Dialog>

              <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ open: false, message: "", severity: "info" })}
                message={snackbar.message}
              />
            </Container>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default GenPosts;
