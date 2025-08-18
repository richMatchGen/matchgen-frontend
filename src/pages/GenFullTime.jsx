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

const GenFullTime = () => {
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
        const res = await axios.get("https://matchgen-backend-production.up.railway.app/api/content/matches/last/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Convert single match to array for consistency
        setMatches(Array.isArray(res.data) ? res.data : [res.data]);
      } catch (err) {
        console.error("Failed to load last match", err);
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
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/match/${matchId}/generate-fulltime/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSnackbar({ open: true, message: "Full time post generated!" });
  
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, fulltime_post_url: res.data.url } : m)
      );
    } catch (err) {
      console.error("Error generating full time post", err);
      setSnackbar({ open: true, message: "Failed to generate full time post." });
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
                Full Time Posts
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Generate full time social media posts for completed matches
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Opponent</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Post</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">
                            No completed matches available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell>{match.opponent}</TableCell>
                          <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                          <TableCell>{match.result || "—"}</TableCell>
                          <TableCell>
                            {match.fulltime_post_url ? (
                              <a href={match.fulltime_post_url} target="_blank" rel="noreferrer">View</a>
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

export default GenFullTime;
