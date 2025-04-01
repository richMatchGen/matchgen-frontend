import React, { useState } from "react";
import { TextField, Button, Container, Typography, MenuItem } from "@mui/material";
import axios from "axios";

const CreatePlayer= () => {
    const [form, setForm] = useState({
        club: "",
        name: "",
        squad_no: "",
        player_pic: "",
        formatted_pic: "",
        sponsor: "",
        position: ""

      });

const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
      };

  const handleCreate = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to create a Player.");
      return;
    }

    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/content/players/",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Match created!");
      setForm({
        club: "",
        name: "",
        squad_no: "",
        player_pic: "",
        formatted_pic: "",
        sponsor: "",
        position: "",
      });

    } catch (err) {
      console.error(err);
      alert("Error creating Player.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" align="center">Create a Club</Typography>

      {[
        { label: "name", name: "name" },
        { label: "Squad Number", name: "squad_no" },
        { label: "Player Profile URL", name: "player_pic" },
        { label: "Formatted Pic URL", name: "formatted_pic" },
        { label: "Sponsor Logo URL", name: "sponsor" },
        { label: "Position", name: "position"}

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
        onClick={handleCreate}
      >
        Create Match
      </Button>
    </Container>
  );
};

export default CreatePlayer;
