import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useClubSingleton from "../hooks/useClubSingleton";
import useAuth from "../hooks/useAuth";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  CssBaseline,
  TextField,
  Container,
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
  MenuItem,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  SportsSoccer as SportsIcon,
  Business as BusinessIcon,
  Palette as PaletteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

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

// Sport options
const sportOptions = [
  { value: "football", label: "Football", icon: <SportsIcon />, color: "#1976d2" },
  { value: "basketball", label: "Basketball", icon: <SportsIcon />, color: "#f57c00" },
  { value: "cricket", label: "Cricket", icon: <SportsIcon />, color: "#388e3c" },
  { value: "tennis", label: "Tennis", icon: <SportsIcon />, color: "#7b1fa2" },
  { value: "rugby", label: "Rugby", icon: <SportsIcon />, color: "#d32f2f" },
  { value: "hockey", label: "Hockey", icon: <SportsIcon />, color: "#1976d2" },
  { value: "baseball", label: "Baseball", icon: <SportsIcon />, color: "#f57c00" },
  { value: "soccer", label: "Soccer", icon: <SportsIcon />, color: "#388e3c" },
  { value: "other", label: "Other", icon: <SportsIcon />, color: "#757575" },
];

// Form steps for better UX
const formSteps = [
  { label: "Basic Info", description: "Club name and sport" },
  { label: "Details", description: "Founded year and colors" },
  { label: "Logo", description: "Club logo upload" },
];

const ClubOverview = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { club, loading, error, refreshClub } = useClubSingleton();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    logo: "",
  });
  
  // UI state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [useLogoUrl, setUseLogoUrl] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize form data when club data is available
  useEffect(() => {
    if (club) {
      // console.log("🏢 Club data received in useEffect:", club);
      // console.log("🏢 Club sport value:", club.sport, "type:", typeof club.sport);
      const newFormData = {
        name: club.name || "",
        sport: club.sport || "",
        logo: club.logo || "",
      };
      // console.log("🏢 Setting formData to:", newFormData);
      setFormData(newFormData);
      setLogoUrl(club.logo || "");
    } else {
      // console.log("🏢 No club data available yet");
    }
  }, [club]);

  // Memoized values for performance
  const isFormValid = useMemo(() => {
    // console.log("🏢 Form validation check - formData:", formData);
    // console.log("🏢 formData.sport:", formData.sport, "type:", typeof formData.sport);
    return formData.name.trim() && formData.sport && Object.keys(errors).length === 0;
  }, [formData.name, formData.sport, errors]);

  const formProgress = useMemo(() => {
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim()).length;
    return Math.min((filledFields / Object.keys(formData).length) * 100, 100);
  }, [formData]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Club name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Club name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Club name must be less than 100 characters";
    }
    
    if (!formData.sport) {
      newErrors.sport = "Please select a sport";
    }
    

    if (useLogoUrl && logoUrl && !isValidUrl(logoUrl)) {
      newErrors.logoUrl = "Please enter a valid logo URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, useLogoUrl, logoUrl]);

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

    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      return newData;
    });
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Auto-advance to next step if current step is complete
    if (activeStep === 0 && field === 'sport' && value && formData.name.trim()) {
      setTimeout(() => setActiveStep(1), 500);
    }
  }, [errors, activeStep, formData.name]);

  // Enhanced logo handling
  const handleLogoSelect = useCallback((file) => {
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

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      
      setSaveError("");
      setSnackbar({
        open: true,
        message: "Club logo selected successfully!",
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
    handleLogoSelect(file);
  }, [handleLogoSelect]);

  // Enhanced logo removal
  const handleRemoveLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl("");
    setUseLogoUrl(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSnackbar({
      open: true,
      message: "Club logo removed",
      severity: "info"
    });
  }, []);

  // Enhanced form submission
  const handleSave = useCallback(async () => {
    setSaveError("");
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
      setSaveError("You must be logged in to update club details.");
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    try {
      // Prepare the data
      const clubData = {
        name: formData.name.trim(),
        sport: formData.sport,
        logo: formData.logo || null,
      };

      // Handle logo with progress tracking
      if (useLogoUrl && logoUrl) {
        clubData.logo = logoUrl;
        setUploadProgress(50);
      } else if (logoFile) {
        // Upload logo file to Cloudinary first
        setUploadProgress(25);
        try {
          const logoFormData = new FormData();
          logoFormData.append('logo', logoFile);
          
          const logoResponse = await axios.post(
            'https://matchgen-backend-production.up.railway.app/api/users/club/upload-logo/',
            logoFormData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (logoResponse.data.logo_url) {
            clubData.logo = logoResponse.data.logo_url;
            setUploadProgress(50);
          }
        } catch (logoError) {
          console.error('Logo upload failed:', logoError);
          setSnackbar({
            open: true,
            message: "Logo upload failed, but other details will be saved",
            severity: "warning"
          });
        }
      }

      // Remove null/empty values to avoid validation issues, but keep required fields
      Object.keys(clubData).forEach(key => {
        if (clubData[key] === null || clubData[key] === "") {
          // Don't delete required fields like name and sport
          if (key !== 'name' && key !== 'sport') {
            delete clubData[key];
          }
        }
      });

      // console.log("Sending club data:", clubData);
      // console.log("formData before processing:", formData);
      // console.log("formData.sport value:", formData.sport, "type:", typeof formData.sport);

      const response = await axios.put(
        `https://matchgen-backend-production.up.railway.app/api/users/club/${club.id}/`,
        clubData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log("Club update response:", response.data);

      // Refresh club data to get the updated information
      await refreshClub();

      setSuccess("Club details updated successfully!");
      setSnackbar({
        open: true,
        message: "Club details updated successfully!",
        severity: "success"
      });
      
    } catch (err) {
      console.error("Error updating club:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Error updating club details. Please try again.";
      
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
      
      setSaveError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  }, [validateForm, useLogoUrl, logoUrl, logoFile, formData, club?.id]);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  if (loading && !club) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="60vh"
            >
              <CircularProgress />
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  if (error && !club) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
            <Box p={3}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  if (!club) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              overflow: 'auto',
            })}
          >
            <Container sx={{ py: 4 }}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  No Club Found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  You don't have a club yet. Create one to get started.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/clubs/createclub")}
                  startIcon={<BusinessIcon />}
                >
                  Create Club
                </Button>
              </Paper>
            </Container>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          {/* Progress indicator */}
          <ProgressIndicator sx={{ width: `${formProgress}%` }} />
          
          <Container maxWidth="lg" sx={{ py: 4, mt: { xs: 8, md: 0 } }}>
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
                    Edit Club Details
                  </Typography>
                </Fade>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
                  Update your club information, colors, and logo. Make sure all details are accurate.
                </Typography>
              </Box>

              {/* Enhanced error/success messages */}
              <Collapse in={!!saveError || !!success}>
                {saveError && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    action={
                      <IconButton
                        color="inherit"
                        size="small"
                        onClick={() => setSaveError("")}
                      >
                        <ErrorIcon />
                      </IconButton>
                    }
                  >
                    {saveError}
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
                {/* Single Column - Basic Information and Logo */}
                <Grid item xs={12}>
                  <Stack spacing={3}>
                    {/* Basic Information */}
                    <Zoom in timeout={600}>
                      <StyledCard isActive={activeStep === 0}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                            Basic Information
                          </Typography>
                          
                          <Stack spacing={3}>
                            {/* Enhanced Club Name field */}
                            <TextField
                              fullWidth
                              label="Club Name"
                              value={formData.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                              error={!!errors.name}
                              helperText={errors.name || `${formData.name.length}/100 characters`}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BusinessIcon color="action" />
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

                            {/* Enhanced Sport Selection */}
                            <TextField
                              fullWidth
                              label="Sport"
                              value={formData.sport}
                              onChange={(e) => handleInputChange("sport", e.target.value)}
                              select
                              error={!!errors.sport}
                              helperText={errors.sport}
                              required
                              SelectProps={{
                                MenuProps: {
                                  PaperProps: {
                                    sx: { maxHeight: 300 }
                                  }
                                }
                              }}
                            >
                              {sportOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ color: 'black' }}>
                                      {option.icon}
                                    </Box>
                                    {option.label}
                                  </Box>
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                        </CardContent>
                      </StyledCard>
                    </Zoom>

                    {/* Enhanced Logo Upload */}
                    <Zoom in timeout={800}>
                      <StyledCard isActive={activeStep === 1}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                            Club Logo
                          </Typography>
                          
                          {/* Logo Upload Options */}
                          <Stack spacing={2}>
                            {/* Enhanced toggle between file upload and URL */}
                            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                              <Button
                                variant={!useLogoUrl ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setUseLogoUrl(false)}
                                startIcon={<CloudUploadIcon />}
                              >
                                Upload File
                              </Button>
                              <Button
                                variant={useLogoUrl ? "contained" : "outlined"}
                                size="small"
                                onClick={() => setUseLogoUrl(true)}
                                startIcon={<PaletteIcon />}
                              >
                                Use URL
                              </Button>
                            </Box>

                            {useLogoUrl ? (
                              // Enhanced Logo URL Input
                              <TextField
                                fullWidth
                                label="Club Logo URL"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                helperText={errors.logoUrl || "Enter the URL of the club logo"}
                                error={!!errors.logoUrl}
                              />
                            ) : (
                              // Enhanced File Upload
                              <>
                                {logoPreview ? (
                                  <Box textAlign="center">
                                    <Avatar
                                      src={logoPreview}
                                      alt="Club logo preview"
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
                                    hasError={!!errors.logoUrl}
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
                                  onChange={(e) => handleLogoSelect(e.target.files[0])}
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
                {saving && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {uploadProgress < 50 ? "Preparing..." : uploadProgress < 100 ? "Uploading logo..." : "Updating club details..."}
                    </Typography>
                  </Box>
                )}
                
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    startIcon={<ArrowBackIcon />}
                    disabled={saving}
                  >
                    Back
                  </Button>
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    disabled={saving || !isFormValid}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
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
                    {saving ? "Updating Club..." : "Update Club"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Container>
        </Box>
      </Box>

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
        open={saving}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Updating your club details...
          </Typography>
        </Box>
      </Backdrop>
    </AppTheme>
  );
};

export default ClubOverview;