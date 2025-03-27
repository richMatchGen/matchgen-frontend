import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useClub from "../hooks/useClub";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import axios from "axios";

const EditClub = () => {
  const { clubId } = useParams();                     // ✅ should be inside the component
  const { club, loading, error } = useClub(clubId);   // ✅ same here
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [logo, setLogo] = useState("");

  useEffect(() => {
    if (club) {
      setName(club.name);
      setSport(club.sport);
      setLogo(club.logo);
    }
  }, [club]);

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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
