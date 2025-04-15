import { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, Button, Card, CardContent, CircularProgress, Snackbar } from "@mui/material";

export default function MatchdayPostPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(null); // match ID being generated
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  useEffect(() => {
    axios.get("/api/matches/upcoming/") // your match listing endpoint
      .then(res => setMatches(res.data))
      .catch(err => console.error("Failed to load matches", err));
  }, []);

  const handleGenerate = async (matchId) => {
    setLoading(matchId);
    try {
      const res = await axios.get(`/match/${matchId}/generate-matchday/`);
      setSnackbar({ open: true, message: "Post generated successfully!" });

      // Replace the match in the list with updated one
      setMatches(prev =>
        prev.map(m => m.id === matchId ? { ...m, matchday_post_url: res.data.url } : m)
      );
    } catch (err) {
      console.error("Error generating post", err);
      setSnackbar({ open: true, message: "Failed to generate post." });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Generate Matchday Post</Typography>

      {matches.map((match) => (
        <Card key={match.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">{match.opponent} — {new Date(match.date).toLocaleDateString()}</Typography>
            <Typography variant="body2">{match.venue}</Typography>

            {match.matchday_post_url ? (
              <div style={{ marginTop: 10 }}>
                <Typography variant="body2">✅ Generated</Typography>
                <a href={match.matchday_post_url} target="_blank" rel="noreferrer">View Post</a>
              </div>
            ) : (
              <Button
                variant="contained"
                onClick={() => handleGenerate(match.id)}
                disabled={loading === match.id}
                sx={{ mt: 2 }}
              >
                {loading === match.id ? <CircularProgress size={20} color="inherit" /> : "Generate Post"}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        message={snackbar.message}
      />
    </Container>
  );
}
