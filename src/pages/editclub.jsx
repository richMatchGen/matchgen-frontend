import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

const EditClub = () => {
  const { id } = useParams(); // get club ID from route
  const [club, setClub] = useState({ name: "", logo: "", sport: "" });

  const fetchClub = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/clubs/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClub(response.data);
    } catch (err) {
      alert("Failed to fetch club data.");
    }
  };

  const updateClub = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        `https://matchgen-backend-production.up.railway.app/api/clubs/${id}/`,
        club,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Club updated successfully!");
    } catch (err) {
      alert("Update failed.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClub();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>Edit Club</Typography>
      <TextField
        label="Club Name"
        fullWidth
        margin="normal"
        value={club.name}
        onChange={(e) => setClub({ ...club, name: e.target.value })}
      />
      <TextField
        label="Sport"
        fullWidth
        margin="normal"
        value={club.sport}
        onChange={(e) => setClub({ ...club, sport: e.target.value })}
      />
      <TextField
        label="Logo URL"
        fullWidth
        margin="normal"
        value={club.logo}
        onChange={(e) => setClub({ ...club, logo: e.target.value })}
      />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={updateClub}>
        Save Changes
      </Button>
    </Container>
  );
};

export default EditClub;