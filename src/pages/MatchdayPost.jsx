import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, Snackbar, Paper,
  Box, Card, CardContent, Grid, Chip, Alert
} from "@mui/material";
import { Download, Visibility, SportsSoccer } from '@mui/icons-material';

export default function MatchdayPostPage() {
  const [matches, setMatches] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
  
    axios
      .get("https://matchgen-backend-production.up.railway.app/api/content/fixtures/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
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
      })
      .catch((err) => {
        console.error("Failed to load matches", err);
        setMatches([]); // Set empty array on error
        setSnackbar({ 
          open: true, 
          message: "Failed to load matches. Please try again.", 
          severity: "error" 
        });
      });
  }, []);

  const handleGenerate = async (matchId) => {
    if (!matchId) {
      console.warn("⚠️ Tried to generate with undefined match ID");
      return;
    }
  
    setLoadingId(matchId);
  
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/generate/`,
        {
          content_type: "matchday",
          match_id: matchId,
          regenerate: false
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSnackbar({ 
        open: true, 
        message: "Matchday post generated successfully!", 
        severity: "success" 
      });
  
      setMatches(prev => {
        if (Array.isArray(prev)) {
          return prev.map(m => m.id === matchId ? { ...m, matchday_post_url: res.data.url } : m);
        }
        return prev;
      });
    } catch (err) {
      console.error("Error generating post", err);
      setSnackbar({ 
        open: true, 
        message: `Failed to generate post: ${err.response?.data?.error || err.message}`, 
        severity: "error" 
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownload = (url, matchName) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `matchday-${matchName}-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SportsSoccer sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" gutterBottom>
            Matchday Posts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and download matchday social media posts
          </Typography>
        </Box>
      </Box>

      {matches.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No matches available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create some matches first to generate matchday posts.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match) => (
            <Grid item xs={12} md={6} lg={4} key={match.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        vs {match.opponent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(match.date).toLocaleDateString('en-GB', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {match.time_start && `${match.time_start} • `}{match.venue}
                      </Typography>
                    </Box>
                    <Chip 
                      label={getMatchStatus(match).label} 
                      color={getMatchStatus(match).color} 
                      size="small" 
                    />
                  </Box>

                  {match.matchday_post_url ? (
                    <Box sx={{ mb: 2 }}>
                      <img 
                        src={match.matchday_post_url} 
                        alt={`Matchday post for ${match.opponent}`}
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      mb: 2, 
                      p: 3, 
                      border: '2px dashed #e0e0e0', 
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No post generated yet
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleGenerate(match.id)}
                      disabled={loadingId === match.id}
                      fullWidth
                    >
                      {loadingId === match.id ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : match.matchday_post_url ? (
                        "Regenerate"
                      ) : (
                        "Generate Post"
                      )}
                    </Button>
                    
                    {match.matchday_post_url && (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => window.open(match.matchday_post_url, '_blank')}
                          size="small"
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => handleDownload(match.matchday_post_url, match.opponent)}
                          size="small"
                        >
                          Download
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "", severity: "info" })}
      >
        <Alert 
          onClose={() => setSnackbar({ open: false, message: "", severity: "info" })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
