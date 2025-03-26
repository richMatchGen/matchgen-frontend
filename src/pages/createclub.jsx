import React, { useState } from "react";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import axios from "axios";

const CreateClub = () => {
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [logo, setLogo] = useState("");

  const handleCreate = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to create a club.");
      return;
    }

    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/club/",
        { name, sport, logo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Club created!");
      setName("");
      setSport("");
      setLogo("");
    } catch (err) {
      console.error(err);
      alert("Error creating club.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" align="center">Create a Club</Typography>

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

      <Button variant="contained" color="primary" fullWidth onClick={handleCreate} sx={{ mt: 2 }}>
        Create Club
      </Button>
    </Container>
  );
};

export default CreateClub;
