import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  border: '0px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
  overflow: 'auto',
};

export default function EditFixtureModal({ open, onClose, fixture, onUpdate }) {
  const [form, setForm] = React.useState({
    match_type: '',
    opponent: '',
    home_away: 'HOME',
    opponent_logo: '',
    date: null,
    time_start: '',
    venue: '',
    location: '',
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  // Populate form when fixture changes
  React.useEffect(() => {
    if (fixture) {
      setForm({
        match_type: fixture.match_type || '',
        opponent: fixture.opponent || '',
        home_away: fixture.home_away || 'HOME',
        opponent_logo: fixture.opponent_logo || '',
        date: fixture.date ? new Date(fixture.date) : null,
        time_start: fixture.time_start || '',
        venue: fixture.venue || '',
        location: fixture.location || '',
      });
    }
  }, [fixture]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) setError('');
  };

  const handleDateChange = (newDate) => {
    setForm((prev) => ({ ...prev, date: newDate }));
    if (error) setError('');
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

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to update a match.");
      return;
    }

    setLoading(true);

    try {
      const matchData = {
        match_type: form.match_type.trim(),
        opponent: form.opponent.trim(),
        home_away: form.home_away,
        date: form.date?.toISOString().split("T")[0],
        time_start: form.time_start.trim(),
        venue: form.venue.trim(),
        location: form.location.trim() || null,
      };

      if (form.opponent_logo) {
        matchData.opponent_logo = form.opponent_logo;
      }

      Object.keys(matchData).forEach(key => {
        if (matchData[key] === null || matchData[key] === "") {
          delete matchData[key];
        }
      });

      console.log("Updating match data:", matchData);

      const response = await axios.put(
        `https://matchgen-backend-production.up.railway.app/api/content/matches/${fixture.id}/`,
        matchData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Match update response:", response.data);

      setSuccess("Match updated successfully!");
      
      // Call the onUpdate callback to refresh the parent component
      if (onUpdate) {
        onUpdate(response.data);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Error updating match:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Error updating match. Please try again.";
      
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

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-fixture-modal-title"
      aria-describedby="edit-fixture-modal-description"
    >
      <Box sx={style}>
        <Typography variant="h5" component="h2" gutterBottom>
          Edit Fixture
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Match Type"
            name="match_type"
            value={form.match_type}
            onChange={handleChange}
            required
            placeholder="e.g., League, Cup, Friendly"
          />

          <TextField
            fullWidth
            label="Opponent"
            name="opponent"
            value={form.opponent}
            onChange={handleChange}
            required
            placeholder="e.g., Manchester United"
          />

          <FormControl fullWidth>
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
          <Button component="label" fullWidth variant="outlined">
            {form.opponent_logo ? 'Change Opponent Logo' : 'Upload Opponent Logo'}
            <input
              type="file"
              name="opponent_logo"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          {form.opponent_logo && (
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={form.opponent_logo} 
                alt="Opponent logo" 
                style={{ maxWidth: '100px', maxHeight: '100px' }} 
              />
            </Box>
          )}

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date *"
              value={form.date}
              onChange={handleDateChange}
              renderInput={(params) => (
                <TextField fullWidth {...params} required />
              )}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="Time Start"
            name="time_start"
            value={form.time_start}
            onChange={handleChange}
            required
            placeholder="e.g., 15:00"
          />

          <TextField
            fullWidth
            label="Venue"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            required
            placeholder="e.g., Old Trafford"
          />

          <TextField
            fullWidth
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="e.g., Manchester, UK"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              fullWidth
            >
              {loading ? "Updating..." : "Update Fixture"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

