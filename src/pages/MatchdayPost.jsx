import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, Snackbar, Paper
} from "@mui/material";

export default function MatchdayPostPage() {
  const [matches, setMatches] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
  
    axios
      .get("https://matchgen-backend-production.up.railway.app/api/content/fixtures/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setMatches(res.data))
      .catch((err) => console.error("Failed to load matches", err));
  }, []);

  const handleGenerate = async (matchId) => {
    if (!matchId) {
      console.warn("⚠️ Tried to generate with undefined match ID");
      return;
    }
  
    setLoadingId(matchId);
  
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/match/${matchId}/generate-matchday/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSnackbar({ open: true, message: "Post generated!" });
  
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, matchday_post_url: res.data.url } : m)
      );
    } catch (err) {
      console.error("Error generating post", err);
      setSnackbar({ open: true, message: "Failed to generate post." });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Matchday Posts
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
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{match.opponent}</TableCell>
                <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                <TableCell>{match.venue}</TableCell>
                <TableCell>
                  {match.matchday_post_url ? (
                    <a href={match.matchday_post_url} target="_blank" rel="noreferrer">View</a>
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
            ))}
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
  );
}
