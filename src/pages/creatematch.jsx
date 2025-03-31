import React, { useState } from "react";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import axios from "axios";

const CreateMatch= () => {
    const [form, setForm] = useState({
        match_type: "",
        opponent: "",
        club_logo: "",
        opponent_logo: "",
        sponsor: "",
        date: "",
        time_start: "",
        venue: "",
        location: ""
      });

const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
      };

  const handleCreate = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to create a Fixture.");
      return;
    }

    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/content/matches/",
        { name, sport, logo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Club created!");
      setForm({
        match_type: "",
        opponent: "",
        club_logo: "",
        opponent_logo: "",
        sponsor: "",
        date: "",
        time_start: "",
        venue: "",
        location: ""
      });

    } catch (err) {
      console.error(err);
      alert("Error creating Fixture.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" align="center">Create a Club</Typography>

      {[
        { label: "Match Type", name: "match_type" },
        { label: "Opponent", name: "opponent" },
        { label: "Club Logo URL", name: "club_logo" },
        { label: "Opponent Logo URL", name: "opponent_logo" },
        { label: "Sponsor Logo URL", name: "sponsor" },
        { label: "Date", name: "date", type: "datetime-local" },
        { label: "Time Start", name: "time_start" },
        { label: "Venue", name: "venue" },
        { label: "Location", name: "location" },
      ].map(({ label, name, type }) => (
        <TextField
          key={name}
          fullWidth
          label={label}
          name={name}
          type={type || "text"}
          value={form[name]}
          onChange={handleChange}
          margin="normal"
        />
      ))}

      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
      >
        Create Match
      </Button>
    </Container>
  );
};

export default CreateMatch;
