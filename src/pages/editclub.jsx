import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import axios from "axios";

const EditClub = ({ clubId }) => {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [logo, setLogo] = useState("");

  const token = localStorage.getItem("accessToken");

  // Load club details
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(
          `https://matchgen-backend-production.up.railway.app/api/users/club/${clubId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setName(res.data.name);
        setSport(res.data.sport);
        setLogo(res.data.logo);
      } catch (err) {
        console.error("Error fetching club", err);
      }
    };

    if (clubId) {
      fetchClub();
    }
  }, [clubId]);

  const handleUpdate = async () => {
    try {
      await axios.put(
        `https://matchgen-backend-production.up.railway.app/api/users/club/${clubId}/`,
        { name, sport, logo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Club updated!");
    } catch (err) {
      console.error(err);
      alert("Error updating club.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" align="center">Edit Club</Typography>

      <TextField
        fullWidth
        label="Club Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Sport"
        value={sport}
        onChange={(e) => setSport(e.target.value)}
        margin="normal"
        select
      >
        <MenuItem value="football">Football</MenuItem>
        <MenuItem value="rugby">Rugby</MenuItem>
        <MenuItem value="cricket">Cricket</MenuItem>
        <MenuItem value="hockey">Hockey</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>

      <TextField
        fullWidth
        label="Logo URL"
        value={logo}
        onChange={(e) => setLogo(e.target.value)}
        margin="normal"
      />

      <Button variant="contained" color="primary" fullWidth onClick={handleUpdate} sx={{ mt: 2 }}>
        Update Club
      </Button>
    </Container>
  );
};

export default EditClub;
