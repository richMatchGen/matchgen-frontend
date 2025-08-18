import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider
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
  Refresh
} from '@mui/icons-material';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const GenPosts = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }
  
    const headers = { Authorization: `Bearer ${token}` };
  
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/users/me/", { headers });
        setUser(userRes.data);
      } catch {
        logout();
        return;
      }
  
      try {
        const clubRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/my-club/",
          { headers }
        );
        setClub(clubRes.data);
      } catch {
        console.warn("User might not have a club yet.");
      } finally {
        setLoading(false);
      }
    };

    const fetchMatches = async () => {
      try {
        const res = await axios.get("https://matchgen-backend-production.up.railway.app/api/content/matches/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Handle different response structures
        let matchesData = [];
        if (res.data) {
          if (Array.isArray(res.data)) {
            matchesData = res.data;
          } else if (res.data.results && Array.isArray(res.data.results)) {
            matchesData = res.data.results;
          } else if (res.data.matches && Array.isArray(res.data.matches)) {
            matchesData = res.data.matches;
          } else if (typeof res.data === 'object' && res.data.id) {
            matchesData = [res.data];
          } else if (typeof res.data === 'string') {
            try {
              const parsed = JSON.parse(res.data);
              matchesData = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              console.warn('Failed to parse response data as JSON:', e);
            }
          }
        }
        setMatches(matchesData);
      } catch (err) {
        console.error("Failed to load matches", err);
        setMatches([]); // Set empty array on error
      }
    };
  
    fetchData();
    fetchMatches();
  }, [navigate, logout]);

  const handleGenerate = async (matchId, postType) => {
    if (!matchId) {
      console.warn("⚠️ Tried to generate with undefined match ID");
      return;
    }
  
    setLoadingId(`${matchId}-${postType}`);
  
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
        case 'highlight':
          endpoint = `generate-highlight/`;
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

      const res = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/match/${matchId}/${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSnackbar({ 
        open: true, 
        message: `${postType.charAt(0).toUpperCase() + postType.slice(1)} post generated successfully!`, 
        severity: "success" 
      });
  
      setMatches(prev => {
        if (Array.isArray(prev)) {
          return prev.map(m => m.id === matchId ? { 
            ...m, 
            [`${postType}_post_url`]: res.data.url 
          } : m);
        }
        return prev;
      });
    } catch (err) {
      console.error(`Error generating ${postType} post`, err);
      setSnackbar({ 
        open: true, 
        message: `Failed to generate ${postType} post.`, 
        severity: "error" 
      });
    } finally {
      setLoadingId(null);
    }
  };

  const openMatchDialog = (match) => {
    setSelectedMatch(match);
    setDialogOpen(true);
  };

  const closeMatchDialog = () => {
    setDialogOpen(false);
    setSelectedMatch(null);
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

  const getPostStatus = (match, postType) => {
    const postUrl = match[`${postType}_post_url`];
    return postUrl ? 'generated' : 'not-generated';
  };

  if (loading) return <p>Loading...</p>;
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SportsSoccer sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Social Media Posts
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Generate and manage social media content for all your matches
                  </Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Match Details</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Posts Generated</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(matches) && matches.length > 0 ? (
                      matches.map((match) => {
                        const status = getMatchStatus(match);
                        const postTypes = ['upcoming', 'matchday', 'startingxi', 'highlight', 'halftime', 'fulltime'];
                        const generatedPosts = postTypes.filter(type => getPostStatus(match, type) === 'generated').length;
                        
                        return (
                          <TableRow key={match.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  vs {match.opponent}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(match.date).toLocaleDateString('en-GB', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {match.venue}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={status.label} 
                                color={status.color} 
                                size="small" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">
                                  {generatedPosts}/{postTypes.length}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {postTypes.map((type) => (
                                    <Tooltip key={type} title={`${type.charAt(0).toUpperCase() + type.slice(1)} Post`}>
                                      <Box
                                        sx={{
                                          width: 8,
                                          height: 8,
                                          borderRadius: '50%',
                                          backgroundColor: getPostStatus(match, type) === 'generated' ? 'success.main' : 'grey.300'
                                        }}
                                      />
                                    </Tooltip>
                                  ))}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                onClick={() => openMatchDialog(match)}
                                startIcon={<Visibility />}
                                size="small"
                              >
                                Manage Posts
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary" sx={{ py: 4 }}>
                            No matches available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Match Detail Dialog */}
              <Dialog 
                open={dialogOpen} 
                onClose={closeMatchDialog}
                maxWidth="md"
                fullWidth
              >
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      {selectedMatch && `vs ${selectedMatch.opponent}`}
                    </Typography>
                    <IconButton onClick={closeMatchDialog}>
                      <Refresh />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  {selectedMatch && (
                    <Box>
                      {/* Match Info Card */}
                      <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
                        <CardContent>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                {selectedMatch.opponent}
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                {new Date(selectedMatch.date).toLocaleDateString('en-GB', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                              <Typography variant="body1" color="text.secondary">
                                {selectedMatch.venue}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Chip 
                                  label={getMatchStatus(selectedMatch).label} 
                                  color={getMatchStatus(selectedMatch).color} 
                                  size="large"
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>

                      {/* Generation Options */}
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Generate Social Media Posts
                      </Typography>
                      <Grid container spacing={2}>
                        {[
                          { type: 'upcoming', label: 'Upcoming Fixture', icon: <Schedule />, color: 'primary' },
                          { type: 'matchday', label: 'Matchday', icon: <Today />, color: 'secondary' },
                          { type: 'startingxi', label: 'Starting XI', icon: <SportsSoccer />, color: 'success' },
                          { type: 'highlight', label: 'Highlight', icon: <EmojiEvents />, color: 'warning' },
                          { type: 'halftime', label: 'Half Time', icon: <AccessTime />, color: 'info' },
                          { type: 'fulltime', label: 'Full Time', icon: <CheckCircle />, color: 'error' }
                        ].map((option) => {
                          const postStatus = getPostStatus(selectedMatch, option.type);
                          const isGenerating = loadingId === `${selectedMatch.id}-${option.type}`;
                          
                          return (
                            <Grid item xs={12} sm={6} md={4} key={option.type}>
                              <Card 
                                sx={{ 
                                  height: '100%',
                                  border: postStatus === 'generated' ? 2 : 1,
                                  borderColor: postStatus === 'generated' ? 'success.main' : 'grey.300'
                                }}
                              >
                                <CardContent sx={{ textAlign: 'center' }}>
                                  <Box sx={{ color: `${option.color}.main`, mb: 1 }}>
                                    {option.icon}
                                  </Box>
                                  <Typography variant="h6" sx={{ mb: 1 }}>
                                    {option.label}
                                  </Typography>
                                  
                                  {postStatus === 'generated' ? (
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Visibility />}
                                        onClick={() => window.open(selectedMatch[`${option.type}_post_url`], '_blank')}
                                      >
                                        View
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Download />}
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = selectedMatch[`${option.type}_post_url`];
                                          link.download = `${option.type}_post.png`;
                                          link.click();
                                        }}
                                      >
                                        Download
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      color={option.color}
                                      onClick={() => handleGenerate(selectedMatch.id, option.type)}
                                      disabled={isGenerating}
                                      startIcon={isGenerating ? <CircularProgress size={16} /> : <Share />}
                                      fullWidth
                                    >
                                      {isGenerating ? 'Generating...' : 'Generate'}
                                    </Button>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={closeMatchDialog}>Close</Button>
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
