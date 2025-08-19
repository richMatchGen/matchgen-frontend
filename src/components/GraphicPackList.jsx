import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  CircularProgress,
} from "@mui/material";

export default function GraphicPackList({ onSelect }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sample packs to use as fallback
  const samplePacks = [
    {
      id: 1,
      name: "Classic Football Pack",
      description: "Traditional football graphics with clean, professional design",
      preview_image_url: "https://via.placeholder.com/400x200/1976d2/ffffff?text=Classic+Football+Pack",
    },
    {
      id: 2,
      name: "Modern Sports Pack",
      description: "Contemporary design with bold colors and modern typography",
      preview_image_url: "https://via.placeholder.com/400x200/388e3c/ffffff?text=Modern+Sports+Pack",
    },
    {
      id: 3,
      name: "Premium Elite Pack",
      description: "High-end graphics with premium styling and effects",
      preview_image_url: "https://via.placeholder.com/400x200/ff9800/ffffff?text=Premium+Elite+Pack",
    },
  ];

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get("https://matchgen-backend-production.up.railway.app/api/graphicpack/graphic-packs/");
        const data = Array.isArray(response.data) ? response.data : response.data.results;
        setPacks(data || []);
      } catch (err) {
        console.error("Failed to load packs", err);
        
        // If it's a 404 or any other error, use sample packs
        if (err.response?.status === 404) {
          setError("Graphic packs endpoint not available. Using sample packs.");
        } else {
          setError("Failed to load graphic packs. Using sample packs.");
        }
        
        // Use sample packs as fallback
        setPacks(samplePacks);
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {packs.length === 0 ? (
        <Alert severity="warning">
          No graphic packs available. Please try again later.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {packs.map((pack) => (
            <Grid item xs={12} sm={6} md={4} key={pack.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={pack.preview_image_url}
                  alt={pack.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {pack.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pack.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => onSelect(pack.id)}
                    sx={{ mt: 2 }}
                  >
                    Use this Pack
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
