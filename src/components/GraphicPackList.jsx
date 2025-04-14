import { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

export default function GraphicPackList({ onSelect }) {
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    axios.get("https://matchgen-backend-production.up.railway.app/api/graphicpack/graphic-packs/")
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results;
        setPacks(data || []); // fallback to [] just in case
      })
      .catch(err => console.error("Failed to load packs", err));
  }, []);

  return (
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
  );
}
