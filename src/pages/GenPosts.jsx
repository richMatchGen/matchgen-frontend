import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useClubSingleton from "../hooks/useClubSingleton";
import { getMatches } from "../api/config";
import TemplateEditor from "../components/TemplateEditor";
import QuickTextPositioner from "../components/QuickTextPositioner";
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
  Badge,
  RateLimit,
  LinearProgress
} from "@mui/material";
import {
  PostAdd,
  SportsSoccer,
  CalendarToday,
  AccessTime,
  LocationOn,
  Download,
  Refresh,
  Settings,
  Edit,
  Visibility,
  BatchPrediction,
  Add,
  Remove,
  CheckCircle,
  Error,
  Warning,
  Info,
  PersonAdd,
  Schedule,
  EmojiEvents,
  SwapHoriz,
  Timer,
  Flag
} from "@mui/icons-material";
import AppTheme from "../themes/AppTheme";
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
  const [error, setError] = useState(null);
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
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showQuickPositioner, setShowQuickPositioner] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);

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
      window.location.href = "/login";
      return;
    }

    try {
      const userRes = await axios.get("/api/users/me/", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUser(userRes.data);
    } catch (error) {
      // Handle logout without dependency
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return;
    }
  }, []); // Remove navigate and logout dependencies

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
      } else {
        console.error("Failed to load matches:", result.error);
        if (result.timeout) {
          setError("Request timed out. Please check your connection and try again.");
        } else {
          setError(`Failed to load matches: ${result.error}`);
        }
      }
    } catch (error) {
      console.error("Failed to load matches:", error);
      setError("Failed to load matches. Please try again.");
    }
  }, [urlMatchId]); // Only depend on urlMatchId

  const fetchGraphicPacks = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "https://matchgen-backend-production.up.railway.app/api/graphicpack/graphic-packs/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Graphic packs response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setGraphicPacks(response.data);
        if (response.data.length > 0) {
          setSelectedGraphicPack(response.data[0]);
          console.log('Selected graphic pack:', response.data[0]);
        }
      }
    } catch (error) {
      console.warn("Failed to load graphic packs, using fallback", error);
      // Fallback graphic packs
      setGraphicPacks([
        { id: 1, name: "Default Pack", description: "Standard design" },
        { id: 2, name: "Premium Pack", description: "Enhanced design" }
      ]);
      setSelectedGraphicPack({ id: 1, name: "Default Pack", description: "Standard design" });
    }
  }, []); // No dependencies

  // Initialize data - only run once on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchUserData(),
          fetchMatches(),
          fetchGraphicPacks()
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Empty dependency array - only run once

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
      
      // Map frontend post types to backend content types
      const contentTypeMap = {
        'upcoming': 'upcomingFixture',
        'matchday': 'matchday',
        'startingxi': 'startingXI',
        'goal': 'goal',
        'substitution': 'sub',
        'halftime': 'halftime',
        'fulltime': 'fulltime'
      };
      
      const contentType = contentTypeMap[postType];
      if (!contentType) {
        throw new Error('Invalid post type');
      }

      // Prepare request data based on content type
      const requestData = {
        content_type: contentType,
        match_id: matchId,
        regenerate: false
      };

      // Add specific data for content types that need it
      switch (contentType) {
        case 'goal':
          requestData.scorer_name = customData.scorer_name || 'Player';
          break;
        case 'sub':
          requestData.player_in = customData.player_in || 'Player In';
          requestData.player_out = customData.player_out || 'Player Out';
          break;
        case 'halftime':
        case 'fulltime':
          // Convert home_score and away_score to single score field
          const homeScore = customData.home_score || '0';
          const awayScore = customData.away_score || '0';
          requestData.score = `${homeScore}-${awayScore}`;
          break;
      }

      const response = await axios.post(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/generate/`,
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
          message: `Failed to generate ${postType} post: ${error.response?.data?.error || error.message}`, 
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
  }, []);

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

  if (error) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Card sx={{ p: 4, maxWidth: 400 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Data
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              fullWidth
            >
              Retry
            </Button>
          </Card>
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {selectedMatch && (
                    <>
                                             <Button
                         variant="outlined"
                         startIcon={<Edit />}
                         onClick={() => {
                           // Get the matchday template ID for editing
                           if (selectedGraphicPack) {
                             console.log('Selected GraphicPack:', selectedGraphicPack);
                             const matchdayTemplate = selectedGraphicPack.templates?.find(t => t.content_type === 'matchday');
                             console.log('Matchday template:', matchdayTemplate);
                             if (matchdayTemplate) {
                               setCurrentTemplateId(matchdayTemplate.id);
                               setShowQuickPositioner(true);
                             } else {
                               setSnackbar({
                                 open: true,
                                 message: `No matchday template found in ${selectedGraphicPack.name}. Templates need to be set up in the database.`,
                                 severity: "warning"
                               });
                             }
                           } else {
                             setSnackbar({
                               open: true,
                               message: "Please select a graphic pack first",
                               severity: "warning"
                             });
                           }
                         }}
                       >
                         Quick Position Text
                       </Button>
                       <Button
                         variant="outlined"
                         startIcon={<Edit />}
                         onClick={() => {
                           // Get the matchday template ID for editing
                           if (selectedGraphicPack) {
                             console.log('Selected GraphicPack:', selectedGraphicPack);
                             const matchdayTemplate = selectedGraphicPack.templates?.find(t => t.content_type === 'matchday');
                             console.log('Matchday template:', matchdayTemplate);
                             if (matchdayTemplate) {
                               setCurrentTemplateId(matchdayTemplate.id);
                               setShowTemplateEditor(true);
                             } else {
                               setSnackbar({
                                 open: true,
                                 message: `No matchday template found in ${selectedGraphicPack.name}. Templates need to be set up in the database.`,
                                 severity: "warning"
                               });
                             }
                           } else {
                             setSnackbar({
                               open: true,
                               message: "Please select a graphic pack first",
                               severity: "warning"
                             });
                           }
                         }}
                       >
                         Advanced Editor
                       </Button>
                    </>
                  )}
                                     <Button
                     variant="outlined"
                     startIcon={<Refresh />}
                     onClick={() => {
                       setLoading(true);
                       Promise.all([
                         fetchUserData(),
                         fetchMatches(),
                         fetchGraphicPacks()
                       ]).finally(() => setLoading(false));
                     }}
                   >
                     Refresh
                   </Button>
                                       <Button
                      variant="outlined"
                      startIcon={<Settings />}
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("accessToken");
                          // First test the basic API
                          const testResponse = await axios.get(
                            "https://matchgen-backend-production.up.railway.app/api/graphicpack/test/",
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          console.log('Test response:', testResponse.data);
                          
                          // Then try the debug endpoint
                          const response = await axios.get(
                            "https://matchgen-backend-production.up.railway.app/api/graphicpack/debug/",
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          console.log('Debug response:', response.data);
                          setSnackbar({
                            open: true,
                            message: `Debug: ${response.data.total_packs} packs found`,
                            severity: "info"
                          });
                        } catch (error) {
                          console.error('Debug error:', error);
                          setSnackbar({
                            open: true,
                            message: `Debug error: ${error.message}`,
                            severity: "error"
                          });
                        }
                      }}
                                         >
                       Debug
                     </Button>
                     <Button
                       variant="outlined"
                       startIcon={<Add />}
                       onClick={async () => {
                         try {
                           const token = localStorage.getItem("accessToken");
                           const response = await axios.post(
                             "https://matchgen-backend-production.up.railway.app/api/graphicpack/create-test-data/",
                             {},
                             { headers: { Authorization: `Bearer ${token}` } }
                           );
                           console.log('Create test data response:', response.data);
                           setSnackbar({
                             open: true,
                             message: `Test data created: ${response.data.elements_created} elements`,
                             severity: "success"
                           });
                           // Refresh the graphic packs
                           fetchGraphicPacks();
                         } catch (error) {
                           console.error('Create test data error:', error);
                           setSnackbar({
                             open: true,
                             message: `Create test data error: ${error.message}`,
                             severity: "error"
                           });
                         }
                       }}
                     >
                       Create Test Data
                     </Button>
                </Box>
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

              {/* Generated Posts Preview */}
              {selectedMatch && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generated Posts
                    </Typography>
                    <Grid container spacing={2}>
                      {POST_TYPES.map((postType) => {
                        const postUrl = selectedMatch[`${postType.id}_post_url`];
                        return postUrl ? (
                          <Grid item xs={12} sm={6} md={4} key={postType.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                  {postType.label}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                  <img 
                                    src={postUrl} 
                                    alt={`${postType.label} for ${selectedMatch.opponent}`}
                                    style={{ 
                                      width: '100%', 
                                      height: 'auto', 
                                      borderRadius: '4px',
                                      border: '1px solid #e0e0e0'
                                    }}
                                  />
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Visibility />}
                                    onClick={() => window.open(postUrl, '_blank')}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<Download />}
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = postUrl;
                                      link.download = `${postType.id}-${selectedMatch.opponent}-${new Date().toISOString().split('T')[0]}.png`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                  >
                                    Download
                                  </Button>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                    {!POST_TYPES.some(postType => selectedMatch[`${postType.id}_post_url`]) && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No posts generated yet. Select post types and generate to see previews.
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

                             {/* Quick Text Positioner Dialog */}
               {showQuickPositioner && currentTemplateId && (
                 <QuickTextPositioner
                   templateId={currentTemplateId}
                   onSave={(elements) => {
                     setSnackbar({
                       open: true,
                       message: "Text positions updated successfully!",
                       severity: "success"
                     });
                     setShowQuickPositioner(false);
                   }}
                   onCancel={() => setShowQuickPositioner(false)}
                 />
               )}

               {/* Template Editor Dialog */}
               <Dialog 
                 open={showTemplateEditor} 
                 onClose={() => setShowTemplateEditor(false)}
                 maxWidth="xl"
                 fullWidth
               >
                 <DialogTitle>
                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="h6">Advanced Template Editor</Typography>
                     <IconButton onClick={() => setShowTemplateEditor(false)}>
                       <Remove />
                     </IconButton>
                   </Box>
                 </DialogTitle>
                 <DialogContent sx={{ p: 0 }}>
                   {currentTemplateId && (
                     <TemplateEditor
                       templateId={currentTemplateId}
                       onSave={(elements) => {
                         setSnackbar({
                           open: true,
                           message: "Template updated successfully!",
                           severity: "success"
                         });
                         setShowTemplateEditor(false);
                       }}
                       onCancel={() => setShowTemplateEditor(false)}
                     />
                   )}
                 </DialogContent>
               </Dialog>

              {/* Snackbar */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
              >
                <Alert
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  severity={snackbar.severity}
                  sx={{ width: "100%" }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </Container>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default GenPosts;
