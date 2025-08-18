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
  Stack
} from "@mui/material";
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const GenHalfTime = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

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
        const res = await axios.get("https://matchgen-backend-production.up.railway.app/api/content/matches/matchday/", {
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
        console.error("Failed to load matchday matches", err);
        setMatches([]); // Set empty array on error
      }
    };
  
    fetchData();
    fetchMatches();
  }, [navigate, logout]);

  const handleGenerate = async (matchId) => {
    if (!matchId) {
      console.warn("⚠️ Tried to generate with undefined match ID");
      return;
    }
  
    setLoadingId(matchId);
  
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/match/${matchId}/generate-halftime/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSnackbar({ open: true, message: "Half time post generated!" });
  
      setMatches(prev => {
        if (Array.isArray(prev)) {
          return prev.map(m => m.id === matchId ? { ...m, halftime_post_url: res.data.url } : m);
        }
        return prev;
      });
    } catch (err) {
      console.error("Error generating half time post", err);
      setSnackbar({ open: true, message: "Failed to generate half time post." });
    } finally {
      setLoadingId(null);
    }
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
              <Typography variant="h4" gutterBottom>
                Half Time Posts
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Generate half time social media posts for matchday games
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Opponent</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Venue</TableCell>
                      <TableCell>Post</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            No matchday games available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell>{match.opponent}</TableCell>
                          <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                          <TableCell>{match.venue}</TableCell>
                          <TableCell>
                            {match.halftime_post_url ? (
                              <a href={match.halftime_post_url} target="_blank" rel="noreferrer">View</a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              onClick={() => handleGenerate(match.id)}
                              disabled={loadingId === match.id}
                            >
                              {loadingId === match.id ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                "Generate"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ open: false, message: "" })}
                message={snackbar.message}
              />
            </Container>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default GenHalfTime;
