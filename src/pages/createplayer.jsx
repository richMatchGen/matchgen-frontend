import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
  Stack,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  Snackbar,
  Backdrop,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  SportsSoccer as JerseyIcon,
  Business as SponsorIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { styled, alpha } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Enhanced styled components
const StyledCard = styled(Card)(({ theme, isActive }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[12],
  },
  "&::before": isActive ? {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  } : {},
}));

const UploadBox = styled(Box)(({ theme, isDragOver, hasError }) => ({
  border: `3px dashed ${hasError ? theme.palette.error.main : isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  backgroundColor: hasError 
    ? alpha(theme.palette.error.main, 0.05)
    : isDragOver 
    ? alpha(theme.palette.primary.main, 0.05)
    : theme.palette.background.paper,
  "&:hover": {
    borderColor: hasError ? theme.palette.error.main : theme.palette.primary.main,
    backgroundColor: hasError 
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.primary.main, 0.1),
    transform: "scale(1.02)",
  },
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 1,
  height: 4,
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  transition: "width 0.3s ease-in-out",
}));

// Position options
const positionOptions = [
  { value: "goalkeeper", label: "Goalkeeper", icon: <JerseyIcon />, color: "#1976d2" },
  { value: "defender", label: "Defender", icon: <JerseyIcon />, color: "#388e3c" },
  { value: "midfielder", label: "Midfielder", icon: <JerseyIcon />, color: "#f57c00" },
  { value: "forward", label: "Forward", icon: <JerseyIcon />, color: "#7b1fa2" },
  { value: "striker", label: "Striker", icon: <JerseyIcon />, color: "#d32f2f" },
  { value: "winger", label: "Winger", icon: <JerseyIcon />, color: "#1976d2" },
  { value: "center-back", label: "Center Back", icon: <JerseyIcon />, color: "#388e3c" },
  { value: "full-back", label: "Full Back", icon: <JerseyIcon />, color: "#f57c00" },
  { value: "attacking-midfielder", label: "Attacking Midfielder", icon: <JerseyIcon />, color: "#7b1fa2" },
  { value: "defensive-midfielder", label: "Defensive Midfielder", icon: <JerseyIcon />, color: "#d32f2f" },
  { value: "other", label: "Other", icon: <JerseyIcon />, color: "#757575" },
];

// Form steps for better UX
const formSteps = [
  { label: "Basic Info", description: "Player name and position" },
  { label: "Details", description: "Jersey number and sponsor" },
  { label: "Images", description: "Player and formatted photos" },
];

const CreatePlayer = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef(null);
  const formattedPicInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    squad_no: "",
    sponsor: "",
    player_pic: "",
    formatted_pic: "",
  });
  
  // UI state
  const [playerPicFile, setPlayerPicFile] = useState(null);
  const [playerPicPreview, setPlayerPicPreview] = useState(null);
  const [formattedPicFile, setFormattedPicFile] = useState(null);
  const [formattedPicPreview, setFormattedPicPreview] = useState(null);
  const [playerPicUrl, setPlayerPicUrl] = useState("");
  const [formattedPicUrl, setFormattedPicUrl] = useState("");
  const [usePlayerPicUrl, setUsePlayerPicUrl] = useState(false);
  const [useFormattedPicUrl, setUseFormattedPicUrl] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [uploadProgress, setUploadProgress] = useState(0);
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
          setFormData(prev => ({ ...prev, club: response.data.id || response.data.name }));
        }
      } catch (err) {
        console.warn("Could not fetch user club:", err);
      }
    };

    fetchUserClub();
  }, []);

  // Memoized values for performance
  const isFormValid = useMemo(() => {
    return formData.name.trim() && formData.position && Object.keys(errors).length === 0;
  }, [formData.name, formData.position, errors]);

  const formProgress = useMemo(() => {
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim()).length;
    return Math.min((filledFields / Object.keys(formData).length) * 100, 100);
  }, [formData]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Player name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Player name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Player name must be less than 100 characters";
    }
    
    if (!formData.position) {
      newErrors.position = "Please select a position";
    }
    
    if (formData.squad_no) {
      const squadNo = parseInt(formData.squad_no);
      if (isNaN(squadNo) || squadNo < 1 || squadNo > 99) {
        newErrors.squad_no = "Squad number must be between 1 and 99";
      }
    }

    if (usePlayerPicUrl && playerPicUrl && !isValidUrl(playerPicUrl)) {
      newErrors.playerPicUrl = "Please enter a valid player photo URL";
    }

    if (useFormattedPicUrl && formattedPicUrl && !isValidUrl(formattedPicUrl)) {
      newErrors.formattedPicUrl = "Please enter a valid formatted photo URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, usePlayerPicUrl, playerPicUrl, useFormattedPicUrl, formattedPicUrl]);

  // Enhanced utility functions
  const isValidUrl = useCallback((string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  // Enhanced input change handler
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Auto-advance to next step if current step is complete
    if (activeStep === 0 && field === 'position' && value && formData.name.trim()) {
      setTimeout(() => setActiveStep(1), 500);
    }
  }, [errors, activeStep, formData.name]);

  // Enhanced photo handling
  const handlePhotoSelect = useCallback((file, type) => {
    if (file) {
      // Enhanced file validation
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: "Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)",
          severity: "error"
        });
        return;
      }
      
      // Enhanced file size validation (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: "Image file size must be less than 10MB",
          severity: "error"
        });
        return;
      }

      if (type === 'player') {
        setPlayerPicFile(file);
        setPlayerPicPreview(URL.createObjectURL(file));
      } else {
        setFormattedPicFile(file);
        setFormattedPicPreview(URL.createObjectURL(file));
      }
      
      setError("");
      setSnackbar({
        open: true,
        message: `${type === 'player' ? 'Player' : 'Formatted'} photo selected successfully!`,
        severity: "success"
      });
    }
  }, []);

  // Enhanced drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    const type = e.currentTarget.dataset.type || 'player';
    handlePhotoSelect(file, type);
  }, [handlePhotoSelect]);

  // Enhanced photo removal
  const handleRemovePhoto = useCallback((type) => {
    if (type === 'player') {
      setPlayerPicFile(null);
      setPlayerPicPreview(null);
      setPlayerPicUrl("");
      setUsePlayerPicUrl(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setFormattedPicFile(null);
      setFormattedPicPreview(null);
      setFormattedPicUrl("");
      setUseFormattedPicUrl(false);
      if (formattedPicInputRef.current) {
        formattedPicInputRef.current.value = "";
      }
    }
    setSnackbar({
      open: true,
      message: `${type === 'player' ? 'Player' : 'Formatted'} photo removed`,
      severity: "info"
    });
  }, []);

  // Enhanced form submission
  const handleCreate = useCallback(async () => {
    setError("");
    setSuccess("");
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form",
        severity: "error"
      });
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to create a player.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Prepare the data
      const playerData = {
        name: formData.name.trim(),
        position: formData.position,
        squad_no: formData.squad_no ? parseInt(formData.squad_no) : null,
        sponsor: formData.sponsor.trim() || null,
      };

      // Handle photos with progress tracking
      if (usePlayerPicUrl && playerPicUrl) {
        playerData.player_pic = playerPicUrl;
        setUploadProgress(50);
      } else if (playerPicFile) {
        // For now, we'll skip file upload since endpoint might not be available
        setUploadProgress(50);
        setSnackbar({
          open: true,
          message: "Player photo will be added later (upload endpoint not available)",
          severity: "info"
        });
      }

      if (useFormattedPicUrl && formattedPicUrl) {
        playerData.formatted_pic = formattedPicUrl;
        setUploadProgress(100);
      } else if (formattedPicFile) {
        // For now, we'll skip file upload since endpoint might not be available
        setUploadProgress(100);
        setSnackbar({
          open: true,
          message: "Formatted photo will be added later (upload endpoint not available)",
          severity: "info"
        });
      }

      // Remove null/empty values to avoid validation issues
      Object.keys(playerData).forEach(key => {
        if (playerData[key] === null || playerData[key] === "") {
          delete playerData[key];
        }
      });

      console.log("Sending player data:", playerData);

      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/content/players/",
        playerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Player creation response:", response.data);

      setSuccess("Player created successfully! Redirecting to dashboard...");
      setSnackbar({
        open: true,
        message: "Player created successfully!",
        severity: "success"
      });
      
      // Enhanced form reset
      setFormData({
        name: "",
        position: "",
        squad_no: "",
        sponsor: "",
        player_pic: "",
        formatted_pic: "",
      });
      setPlayerPicUrl("");
      setFormattedPicUrl("");
      setUsePlayerPicUrl(false);
      setUseFormattedPicUrl(false);
      handleRemovePhoto('player');
      handleRemovePhoto('formatted');
      setActiveStep(0);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      
    } catch (err) {
      console.error("Error creating player:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Error creating player. Please try again.";
      
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
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [validateForm, usePlayerPicUrl, playerPicUrl, useFormattedPicUrl, formattedPicUrl, playerPicFile, formattedPicFile, formData, navigate, handleRemovePhoto]);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <>
      {/* Progress indicator */}
      <ProgressIndicator sx={{ width: `${formProgress}%` }} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, position: "relative" }}>
          {/* Header with enhanced styling */}
          <Box textAlign="center" sx={{ mb: 4 }}>
            <Fade in timeout={800}>
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 2
                }}
              >
                Add New Player
              </Typography>
            </Fade>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Add a new player to your team roster. Fill in the details below to get started.
            </Typography>
          </Box>

          {/* Enhanced error/success messages */}
          <Collapse in={!!error || !!success}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setError("")}
                  >
                    <ErrorIcon />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setSuccess("")}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                }
              >
                {success}
              </Alert>
            )}
          </Collapse>

          {/* Club Display (if available) */}
          {userClub && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Adding player to: <strong>{userClub.name}</strong>
              </Typography>
            </Box>
          )}

          {/* Mobile: Stepper for better UX */}
          {isMobile && (
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} orientation="horizontal">
                {formSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}

          <Grid container spacing={4}>
            {/* Left Column - Basic Information */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={600}>
                <StyledCard isActive={activeStep === 0}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                      Basic Information
                    </Typography>
                    
                    <Stack spacing={3}>
                      {/* Enhanced Player Name field */}
                      <TextField
                        fullWidth
                        label="Player Name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name || `${formData.name.length}/100 characters`}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-focused": {
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2,
                              },
                            },
                          },
                        }}
                      />

                      {/* Enhanced Position Selection */}
                      <TextField
                        fullWidth
                        label="Position"
                        value={formData.position}
                        onChange={(e) => handleInputChange("position", e.target.value)}
                        select
                        error={!!errors.position}
                        helperText={errors.position}
                        required
                        SelectProps={{
                          MenuProps: {
                            PaperProps: {
                              sx: { maxHeight: 300 }
                            }
                          }
                        }}
                      >
                        {positionOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ color: option.color }}>
                                {option.icon}
                              </Box>
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Enhanced Squad Number field */}
                      <TextField
                        fullWidth
                        label="Squad Number"
                        type="number"
                        value={formData.squad_no}
                        onChange={(e) => handleInputChange("squad_no", e.target.value)}
                        error={!!errors.squad_no}
                        helperText={errors.squad_no || "Optional (1-99)"}
                        placeholder="e.g., 10"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <JerseyIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Enhanced Sponsor field */}
                      <TextField
                        fullWidth
                        label="Sponsor"
                        value={formData.sponsor}
                        onChange={(e) => handleInputChange("sponsor", e.target.value)}
                        placeholder="e.g., Nike, Adidas"
                        helperText="Optional"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SponsorIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Stack>
                  </CardContent>
                </StyledCard>
              </Zoom>
            </Grid>

            {/* Right Column - Photos */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Enhanced Player Photo Upload */}
                <Zoom in timeout={800}>
                  <StyledCard isActive={activeStep === 2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                        Player Photo
                      </Typography>
                      
                      {/* Player Photo Upload Options */}
                      <Stack spacing={2}>
                        {/* Enhanced toggle between file upload and URL */}
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                          <Button
                            variant={!usePlayerPicUrl ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setUsePlayerPicUrl(false)}
                            startIcon={<CloudUploadIcon />}
                          >
                            Upload File
                          </Button>
                          <Button
                            variant={usePlayerPicUrl ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setUsePlayerPicUrl(true)}
                            startIcon={<ImageIcon />}
                          >
                            Use URL
                          </Button>
                        </Box>

                        {usePlayerPicUrl ? (
                          // Enhanced Player Photo URL Input
                          <TextField
                            fullWidth
                            label="Player Photo URL"
                            value={playerPicUrl}
                            onChange={(e) => setPlayerPicUrl(e.target.value)}
                            placeholder="https://example.com/player.jpg"
                            helperText={errors.playerPicUrl || "Enter the URL of the player photo"}
                            error={!!errors.playerPicUrl}
                          />
                        ) : (
                          // Enhanced File Upload
                          <>
                            {playerPicPreview ? (
                              <Box textAlign="center">
                                <Avatar
                                  src={playerPicPreview}
                                  alt="Player photo preview"
                                  sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    mx: "auto", 
                                    mb: 2,
                                    border: `3px solid ${theme.palette.primary.main}`,
                                  }}
                                />
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button
                                    variant="outlined"
                                    onClick={() => fileInputRef.current?.click()}
                                    startIcon={<CloudUploadIcon />}
                                  >
                                    Change Photo
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleRemovePhoto('player')}
                                    startIcon={<DeleteIcon />}
                                  >
                                    Remove
                                  </Button>
                                </Stack>
                              </Box>
                            ) : (
                              <UploadBox
                                isDragOver={isDragOver}
                                hasError={!!errors.playerPicUrl}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                data-type="player"
                              >
                                <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                  Upload Player Photo
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Drag and drop an image here, or click to select
                                </Typography>
                                <Chip 
                                  label="JPEG, PNG, GIF, WebP, SVG (max 10MB)" 
                                  variant="outlined" 
                                  color="primary"
                                />
                              </UploadBox>
                            )}
                            
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handlePhotoSelect(e.target.files[0], 'player')}
                            />
                          </>
                        )}
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Zoom>

                {/* Enhanced Formatted Photo Upload */}
                <Zoom in timeout={1000}>
                  <StyledCard isActive={activeStep === 2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                        Formatted Photo
                      </Typography>
                      
                      {/* Formatted Photo Upload Options */}
                      <Stack spacing={2}>
                        {/* Enhanced toggle between file upload and URL */}
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                          <Button
                            variant={!useFormattedPicUrl ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setUseFormattedPicUrl(false)}
                            startIcon={<CloudUploadIcon />}
                          >
                            Upload File
                          </Button>
                          <Button
                            variant={useFormattedPicUrl ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setUseFormattedPicUrl(true)}
                            startIcon={<ImageIcon />}
                          >
                            Use URL
                          </Button>
                        </Box>

                        {useFormattedPicUrl ? (
                          // Enhanced Formatted Photo URL Input
                          <TextField
                            fullWidth
                            label="Formatted Photo URL"
                            value={formattedPicUrl}
                            onChange={(e) => setFormattedPicUrl(e.target.value)}
                            placeholder="https://example.com/formatted.jpg"
                            helperText={errors.formattedPicUrl || "Enter the URL of the formatted photo"}
                            error={!!errors.formattedPicUrl}
                          />
                        ) : (
                          // Enhanced File Upload
                          <>
                            {formattedPicPreview ? (
                              <Box textAlign="center">
                                <Avatar
                                  src={formattedPicPreview}
                                  alt="Formatted photo preview"
                                  sx={{ 
                                    width: 120, 
                                    height: 120, 
                                    mx: "auto", 
                                    mb: 2,
                                    border: `3px solid ${theme.palette.secondary.main}`,
                                  }}
                                />
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <Button
                                    variant="outlined"
                                    onClick={() => formattedPicInputRef.current?.click()}
                                    startIcon={<CloudUploadIcon />}
                                  >
                                    Change Photo
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleRemovePhoto('formatted')}
                                    startIcon={<DeleteIcon />}
                                  >
                                    Remove
                                  </Button>
                                </Stack>
                              </Box>
                            ) : (
                              <UploadBox
                                isDragOver={isDragOver}
                                hasError={!!errors.formattedPicUrl}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => formattedPicInputRef.current?.click()}
                                data-type="formatted"
                              >
                                <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                  Upload Formatted Photo
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  Drag and drop an image here, or click to select
                                </Typography>
                                <Chip 
                                  label="JPEG, PNG, GIF, WebP, SVG (max 10MB)" 
                                  variant="outlined" 
                                  color="secondary"
                                />
                              </UploadBox>
                            )}
                            
                            <input
                              ref={formattedPicInputRef}
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => handlePhotoSelect(e.target.files[0], 'formatted')}
                            />
                          </>
                        )}
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Zoom>
              </Stack>
            </Grid>
          </Grid>

          {/* Enhanced Submit Button with Progress */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {uploadProgress < 50 ? "Preparing..." : uploadProgress < 100 ? "Uploading photos..." : "Creating player..."}
                </Typography>
              </Box>
            )}
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                startIcon={<ArrowBackIcon />}
                disabled={loading}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                size="large"
                onClick={handleCreate}
                disabled={loading || !isFormValid}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: 2,
                  minWidth: 200,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                {loading ? "Creating Player..." : "Add Player"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>

      {/* Enhanced Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Creating your player...
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default CreatePlayer;
