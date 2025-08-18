import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Container,
  Typography,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  SportsSoccer as FootballIcon,
  SportsRugby as RugbyIcon,
  SportsCricket as CricketIcon,
  SportsHockey as HockeyIcon,
  Sports as OtherSportIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as FoundedIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Styled components for better visual appeal
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const UploadBox = styled(Box)(({ theme, isDragOver }) => ({
  border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  backgroundColor: isDragOver ? theme.palette.primary.50 : theme.palette.background.paper,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.50,
  },
}));

const sportOptions = [
  { value: "football", label: "Football", icon: <FootballIcon /> },
  { value: "rugby", label: "Rugby", icon: <RugbyIcon /> },
  { value: "cricket", label: "Cricket", icon: <CricketIcon /> },
  { value: "hockey", label: "Hockey", icon: <HockeyIcon /> },
  { value: "basketball", label: "Basketball", icon: <OtherSportIcon /> },
  { value: "tennis", label: "Tennis", icon: <OtherSportIcon /> },
  { value: "volleyball", label: "Volleyball", icon: <OtherSportIcon /> },
  { value: "other", label: "Other", icon: <OtherSportIcon /> },
];

const CreateClub = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    location: "",
    founded_year: "",
    description: "",
    website: "",
    email: "",
    phone: "",
  });
  
  // UI state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  // Handle logo file selection
  const handleLogoSelect = (file) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Logo file size must be less than 5MB");
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleLogoSelect(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Club name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Club name must be at least 2 characters";
    }
    
    if (!formData.sport) {
      newErrors.sport = "Please select a sport";
    }
    
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL";
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.founded_year && (formData.founded_year < 1800 || formData.founded_year > new Date().getFullYear())) {
      newErrors.founded_year = "Please enter a valid year";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Utility functions
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submission
  const handleCreate = async () => {
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to create a club.");
      return;
    }

    setLoading(true);

    try {
      // First, upload logo if provided
      let logoUrl = "";
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        
        const uploadResponse = await axios.post(
          "https://matchgen-backend-production.up.railway.app/api/users/club/upload-logo/",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        logoUrl = uploadResponse.data.logo_url;
      }

      // Create club with all data
      const clubData = {
        ...formData,
        logo: logoUrl,
      };

      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/club/",
        clubData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Club created successfully! Redirecting to club overview...");
      
      // Reset form
      setFormData({
        name: "",
        sport: "",
        location: "",
        founded_year: "",
        description: "",
        website: "",
        email: "",
        phone: "",
      });
      handleRemoveLogo();
      
      // Redirect to club overview after 2 seconds
      setTimeout(() => {
        navigate("/club");
      }, 2000);
      
    } catch (err) {
      console.error("Error creating club:", err);
      setError(err.response?.data?.error || "Error creating club. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Create Your Club
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Set up your sports club and start managing your team, fixtures, and results. 
            Fill in the details below to get started.
          </Typography>
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Left Column - Basic Information */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                  Basic Information
                </Typography>
                
                <Stack spacing={3}>
                  {/* Club Name */}
                  <TextField
                    fullWidth
                    label="Club Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AddIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Sport Selection */}
                  <TextField
                    fullWidth
                    label="Sport"
                    value={formData.sport}
                    onChange={(e) => handleInputChange("sport", e.target.value)}
                    select
                    error={!!errors.sport}
                    helperText={errors.sport}
                    required
                  >
                    {sportOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {option.icon}
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Location */}
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Founded Year */}
                  <TextField
                    fullWidth
                    label="Founded Year"
                    type="number"
                    value={formData.founded_year}
                    onChange={(e) => handleInputChange("founded_year", e.target.value)}
                    error={!!errors.founded_year}
                    helperText={errors.founded_year}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FoundedIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Description */}
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    multiline
                    rows={4}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Right Column - Contact & Logo */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Contact Information */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                    Contact Information
                  </Typography>
                  
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      error={!!errors.website}
                      helperText={errors.website}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WebsiteIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </CardContent>
              </StyledCard>

              {/* Logo Upload */}
              <StyledCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                    Club Logo
                  </Typography>
                  
                  {logoPreview ? (
                    <Box textAlign="center">
                      <Avatar
                        src={logoPreview}
                        alt="Club logo preview"
                        sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                      />
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="outlined"
                          onClick={() => fileInputRef.current?.click()}
                          startIcon={<CloudUploadIcon />}
                        >
                          Change Logo
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={handleRemoveLogo}
                          startIcon={<DeleteIcon />}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <UploadBox
                      isDragOver={isDragOver}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Upload Club Logo
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Drag and drop an image here, or click to select
                      </Typography>
                      <Chip label="JPEG, PNG, GIF, WebP (max 5MB)" variant="outlined" />
                    </UploadBox>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleLogoSelect(e.target.files[0])}
                  />
                </CardContent>
              </StyledCard>
            </Stack>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              borderRadius: 2,
              minWidth: 200,
            }}
          >
            {loading ? "Creating Club..." : "Create Club"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateClub;
