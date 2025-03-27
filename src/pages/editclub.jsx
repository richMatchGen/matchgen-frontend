import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import axios from "axios";

// const token = localStorage.getItem("accessToken");
// console.log("Using token:", token);

const EditClub = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [logo, setLogo] = useState("");

  console.log({ clubId })
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `https://matchgen-backend-production.up.railway.app/api/users/club/${clubId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const club = res.data;
        setName(club.name);
        setSport(club.sport);
        setLogo(club.logo);
      } catch (err) {
        console.error("Error fetching club:", err);
        alert("Could not load club details.");
      }
    };

    fetchClub();
  }, [clubId]);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `https://matchgen-backend-production.up.railway.app/api/users/club/${clubId}/`,
        { name, sport, logo },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Club updated!");
      navigate("/dashboard");
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
        Save Changes
      </Button>
    </Container>
  );
};

export default EditClub;
