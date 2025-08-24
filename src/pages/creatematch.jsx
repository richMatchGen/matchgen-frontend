import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
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
    home_away: "HOME", // Add home/away field
    club_logo: null,
    opponent_logo: null,
    sponsor: null,
    date: null,
    time_start: "",
    venue: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userClub, setUserClub] = useState(null);

  // Fetch user's club on component mount
  useEffect(() => {
    const fetchUserClub = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/my-club",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data) {
          setUserClub(response.data);
          setForm(prev => ({ ...prev, club: response.data.id || response.data.name }));
        }
      } catch (err) {
        console.warn("Could not fetch user club:", err);
      }
    };

    fetchUserClub();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "matchgen_unsigned");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dxoxuyz0j/image/upload",
      formData
    );

    return response.data.secure_url;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadToCloudinary(file);
      setForm((prev) => ({
        ...prev,
        opponent_logo: imageUrl,
      }));
      setSuccess("Logo uploaded successfully!");
    } catch (err) {
      setError("Failed to upload logo. Please try again.");
    }
  };

  const handleDateChange = (newDate) => {
    setForm((prev) => ({ ...prev, date: newDate }));
    if (error) setError("");
  };

  const validateForm = () => {
    if (!form.match_type.trim()) {
      setError("Match type is required");
      return false;
    }
    if (!form.opponent.trim()) {
      setError("Opponent is required");
      return false;
    }
    if (!form.date) {
      setError("Date is required");
      return false;
    }
    if (!form.time_start.trim()) {
      setError("Time is required");
      return false;
    }
    if (!form.venue.trim()) {
      setError("Venue is required");
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to create a match.");
      return;
    }

    setLoading(true);

    try {
      // Prepare the data - use JSON instead of FormData for better compatibility
      const matchData = {
        match_type: form.match_type.trim(),
        opponent: form.opponent.trim(),
        home_away: form.home_away, // Add home/away to the data
        date: form.date?.toISOString().split("T")[0],
        time_start: form.time_start.trim(),
        venue: form.venue.trim(),
        location: form.location.trim() || null,
      };

      // Only add logo if it exists
      if (form.opponent_logo) {
        matchData.opponent_logo = form.opponent_logo;
      }

      // Remove null/empty values
      Object.keys(matchData).forEach(key => {
        if (matchData[key] === null || matchData[key] === "") {
          delete matchData[key];
        }
      });

      console.log("Sending match data:", matchData);

      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/content/matches/",
        matchData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Match creation response:", response.data);

      setSuccess("Match created successfully!");
      setForm({
        club: userClub?.id || userClub?.name || "",
        match_type: "",
        opponent: "",
        home_away: "HOME", // Reset home/away field
        club_logo: null,
        opponent_logo: null,
        sponsor: null,
        date: null,
        time_start: "",
        venue: "",
        location: "",
      });
    } catch (err) {
      console.error("Error creating match:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Error creating match. Please try again.";
      
      if (err.response?.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(', ');
        } else {
          // Handle field-specific errors
          const fieldErrors = [];
          Object.keys(err.response.data).forEach(field => {
            if (Array.isArray(err.response.data[field])) {
              fieldErrors.push(`${field}: ${err.response.data[field].join(', ')}`);
            } else {
              fieldErrors.push(`${field}: ${err.response.data[field]}`);
            }
          });
          if (fieldErrors.length > 0) {
            errorMessage = fieldErrors.join('; ');
          }
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create Match
      </Typography>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Club Display (if available) */}
      {userClub && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Creating match for: <strong>{userClub.name}</strong>
          </Typography>
        </Box>
      )}

      <TextField
        fullWidth
        label="Match Type"
        name="match_type"
        value={form.match_type}
        onChange={handleChange}
        margin="normal"
        required
        placeholder="e.g., League, Cup, Friendly"
      />

      <TextField
        fullWidth
        label="Opponent"
        name="opponent"
        value={form.opponent}
        onChange={handleChange}
        margin="normal"
        required
        placeholder="e.g., Manchester United"
      />

      {/* Home/Away Selection */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Fixture Type</InputLabel>
        <Select
          name="home_away"
          value={form.home_away}
          onChange={handleChange}
          label="Fixture Type"
        >
          <MenuItem value="HOME">Home Fixture</MenuItem>
          <MenuItem value="AWAY">Away Fixture</MenuItem>
        </Select>
      </FormControl>

      {/* Opponent Logo Upload */}
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

      {/* Date Picker */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Date *"
          value={form.date}
          onChange={handleDateChange}
          renderInput={(params) => (
            <TextField fullWidth margin="normal" {...params} required />
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
        required
        placeholder="e.g., 15:00"
      />

      <TextField
        fullWidth
        label="Venue"
        name="venue"
        value={form.venue}
        onChange={handleChange}
        margin="normal"
        required
        placeholder="e.g., Old Trafford"
      />

      <TextField
        fullWidth
        label="Location"
        name="location"
        value={form.location}
        onChange={handleChange}
        margin="normal"
        placeholder="e.g., Manchester, UK"
      />

      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleCreate}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? "Creating Match..." : "Create Match"}
      </Button>
    </Container>
  );
};

export default CreateMatch;
