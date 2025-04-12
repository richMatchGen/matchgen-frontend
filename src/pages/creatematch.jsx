import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

const CreateMatch = () => {
  const [form, setForm] = useState({
    club: "",
    match_type: "",
    opponent: "",
    club_logo: null,
    opponent_logo: null,
    sponsor: null,
    date: null,
    time_start: "",
    venue: "",
    location: "",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };


  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "matchgen_unsigned"); // must match Cloudinary exactly
  
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dxoxuyz0j/image/upload",
      formData
    );
  
    return response.data.secure_url;
  };
  

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = await uploadToCloudinary(file);

    setForm((prev) => ({
      ...prev,
      club_logo: imageUrl, // now this is a URL, perfect for your Django backend
      opponent_logo: imageUrl,
    }));
  };

  const handleDateChange = (newDate) => {
    setForm((prev) => ({ ...prev, date: newDate }));
  };

  const handleCreate = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to create a Fixture.");
      return;
    }

    const formData = new FormData();
    formData.append("club", form.club);
    formData.append("match_type", form.match_type);
    formData.append("opponent", form.opponent);
    // formData.append("club_logo", form.club_logo);
    formData.append("opponent_logo", form.opponent_logo);
    // formData.append("sponsor", form.sponsor);
    formData.append("date", form.date?.toISOString().split("T")[0]);
    formData.append("time_start", form.time_start);
    formData.append("venue", form.venue);
    formData.append("location", form.location);
  

    for (const [key, val] of formData.entries()) {
      console.log(`${key}:`, val);
    }

    try {
      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/content/matches/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Match created!");
      setForm({
        club: "",
        match_type: "",
        opponent: "",
        club_logo: null,
        opponent_logo: null,
        // sponsor: null,
        date: null,
        time_start: "",
        venue: "",
        location: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error creating Fixture.");
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" align="center">
        Create Match
      </Typography>

      <TextField
        fullWidth
        label="Match Type"
        name="match_type"
        value={form.match_type}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Opponent"
        name="opponent"
        value={form.opponent}
        onChange={handleChange}
        margin="normal"
      />

      {/* Logo upload fields */}
      {/* <Button component="label" fullWidth variant="outlined" sx={{ mt: 2 }}>
        Upload Club Logo
        <input
          type="file"
          name="club_logo"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button> */}

      <Button component="label" fullWidth variant="outlined" sx={{ mt: 2 }}>
        Upload Opponent Logo
        <input
          type="file"
          name="opponent_logo"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </Button>

      {/* <Button component="label" fullWidth variant="outlined" sx={{ mt: 2 }}>
        Upload Sponsor Logo
        <input
          type="file"
          name="sponsor"
          hidden
          accept="image/*"
          onChange={handleChange}
        />
      </Button> */}

      {/* Date Picker */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date"
          value={form.date}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField fullWidth margin="normal" {...params} />
          )}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        label="Time Start"
        name="time_start"
        value={form.time_start}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Venue"
        name="venue"
        value={form.venue}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Location"
        name="location"
        value={form.location}
        onChange={handleChange}
        margin="normal"
      />

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

export default CreateMatch;
