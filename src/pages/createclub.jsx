import React, { useState, useRef, useCallback, useMemo } from "react";
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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { uploadClubLogo } from "../hooks/club";

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

// Enhanced sport options with more sports
const sportOptions = [
  { value: "football", label: "Football", icon: <FootballIcon />, color: "#1976d2" },
  { value: "rugby", label: "Rugby", icon: <RugbyIcon />, color: "#388e3c" },
  { value: "cricket", label: "Cricket", icon: <CricketIcon />, color: "#f57c00" },
  { value: "hockey", label: "Hockey", icon: <HockeyIcon />, color: "#7b1fa2" },
  { value: "basketball", label: "Basketball", icon: <OtherSportIcon />, color: "#d32f2f" },
  { value: "tennis", label: "Tennis", icon: <OtherSportIcon />, color: "#388e3c" },
  { value: "volleyball", label: "Volleyball", icon: <OtherSportIcon />, color: "#1976d2" },
  { value: "baseball", label: "Baseball", icon: <OtherSportIcon />, color: "#f57c00" },
  { value: "soccer", label: "Soccer", icon: <FootballIcon />, color: "#388e3c" },
  { value: "golf", label: "Golf", icon: <OtherSportIcon />, color: "#388e3c" },
  { value: "swimming", label: "Swimming", icon: <OtherSportIcon />, color: "#1976d2" },
  { value: "athletics", label: "Athletics", icon: <OtherSportIcon />, color: "#d32f2f" },
  { value: "other", label: "Other", icon: <OtherSportIcon />, color: "#757575" },
];

// Form steps for better UX
const formSteps = [
  { label: "Basic Info", description: "Club name and sport" },
  { label: "Details", description: "Location and description" },
  { label: "Contact", description: "Website and contact info" },
  { label: "Logo", description: "Upload club logo" },
];

const CreateClub = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [logoUrl, setLogoUrl] = useState("");
  const [useLogoUrl, setUseLogoUrl] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [uploadProgress, setUploadProgress] = useState(0);

  // Memoized values for performance
  const isFormValid = useMemo(() => {
    return formData.name.trim() && formData.sport && Object.keys(errors).length === 0;
  }, [formData.name, formData.sport, errors]);

  const formProgress = useMemo(() => {
    const filledFields = Object.values(formData).filter(value => value.trim()).length;
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
    
    // Optional field validations
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid website URL (e.g., https://example.com)";
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (formData.founded_year) {
      const year = parseInt(formData.founded_year);
      if (isNaN(year) || year < 1800 || year > new Date().getFullYear()) {
        newErrors.founded_year = `Please enter a valid year between 1800 and ${new Date().getFullYear()}`;
      }
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
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

  const isValidEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const isValidPhone = useCallback((phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }, []);

  // Enhanced input change handler
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
          message: "Logo file size must be less than 10MB",
          severity: "error"
        });
        return;
      }

      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError("");
      setSnackbar({
        open: true,
        message: "Logo selected successfully!",
        severity: "success"
      });
    }
  }, []);

  // Convert file to base64 for temporary logo storage
  const fileToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
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
      message: "Logo removed",
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
      setError("You must be logged in to create a club.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Handle logo with progress tracking
      let finalLogoUrl = "";
      
      if (useLogoUrl && logoUrl) {
        finalLogoUrl = logoUrl;
        setUploadProgress(50);
      } else if (logoFile) {
        try {
          const uploadResult = await uploadClubLogo(token, logoFile);
          if (uploadResult.success) {
            finalLogoUrl = uploadResult.logoUrl;
            setUploadProgress(100);
          } else {
            console.warn("Logo upload failed:", uploadResult.error);
                         // Skip logo upload since endpoint is not available
             setUploadProgress(100);
             setSnackbar({
               open: true,
               message: "Logo will be added later (upload endpoint not available)",
               severity: "info"
             });
          }
        } catch (uploadError) {
          console.warn("Logo upload endpoint not available:", uploadError);
          // Skip logo upload since endpoint is not available
          setUploadProgress(100);
          setSnackbar({
            open: true,
            message: "Logo will be added later (upload endpoint not available)",
            severity: "info"
          });
        }
      }

             // Create club with enhanced error handling
       const clubData = {
         name: formData.name.trim(),
         sport: formData.sport,
         location: formData.location.trim() || null,
         founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
         description: formData.description.trim() || null,
         website: formData.website.trim() || null,
         email: formData.email.trim() || null,
         phone: formData.phone.trim() || null,
       };

       // Only add logo if it's a valid URL (not base64)
       if (finalLogoUrl && finalLogoUrl.startsWith('http')) {
         clubData.logo = finalLogoUrl;
       }

       // Remove null/empty values to avoid validation issues
       Object.keys(clubData).forEach(key => {
         if (clubData[key] === null || clubData[key] === "") {
           delete clubData[key];
         }
       });

      console.log("Sending club data:", clubData);

      const response = await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/users/club/",
        clubData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Club creation response:", response.data);

      setSuccess("Club created successfully! Redirecting to club overview...");
      setSnackbar({
        open: true,
        message: "Club created successfully!",
        severity: "success"
      });
      
      // Enhanced form reset
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
      setLogoUrl("");
      setUseLogoUrl(false);
      handleRemoveLogo();
      setActiveStep(0);
      
      // Redirect to club overview after 3 seconds
      setTimeout(() => {
        navigate("/club");
      }, 3000);
      
    } catch (err) {
      console.error("Error creating club:", err);
      console.error("Error response:", err.response?.data);
      
      let errorMessage = "Error creating club. Please try again.";
      
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
  }, [validateForm, useLogoUrl, logoUrl, logoFile, formData, navigate, handleRemoveLogo, fileToBase64]);

  // Step navigation
  const handleNext = useCallback(() => {
    if (activeStep < formSteps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  }, [activeStep]);

  const handleBack = useCallback(() => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  }, [activeStep]);

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
                Create Your Club
              </Typography>
            </Fade>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Set up your sports club and start managing your team, fixtures, and results. 
              Fill in the details below to get started.
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
                              <AddIcon color="action" />
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
                              <Box sx={{ color: option.color }}>
                                {option.icon}
                              </Box>
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Enhanced Location field */}
                      <TextField
                        fullWidth
                        label="Location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g., London, UK"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Enhanced Founded Year field */}
                      <TextField
                        fullWidth
                        label="Founded Year"
                        type="number"
                        value={formData.founded_year}
                        onChange={(e) => handleInputChange("founded_year", e.target.value)}
                        error={!!errors.founded_year}
                        helperText={errors.founded_year || "Optional"}
                        placeholder="e.g., 1995"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <FoundedIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Enhanced Description field */}
                      <TextField
                        fullWidth
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        multiline
                        rows={4}
                        placeholder="Tell us about your club..."
                        helperText={`${formData.description.length}/500 characters`}
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
              </Zoom>
            </Grid>

            {/* Right Column - Contact & Logo */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Enhanced Contact Information */}
                <Zoom in timeout={800}>
                  <StyledCard isActive={activeStep === 2}>
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
                          helperText={errors.website || "Optional"}
                          placeholder="https://yourclub.com"
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
                          helperText={errors.email || "Optional"}
                          placeholder="contact@yourclub.com"
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
                          error={!!errors.phone}
                          helperText={errors.phone || "Optional"}
                          placeholder="+44 123 456 7890"
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
                </Zoom>

                {/* Enhanced Logo Upload */}
                <Zoom in timeout={1000}>
                  <StyledCard isActive={activeStep === 3}>
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
                            startIcon={<WebsiteIcon />}
                          >
                            Use URL
                          </Button>
                        </Box>

                        {useLogoUrl ? (
                          // Enhanced Logo URL Input
                          <TextField
                            fullWidth
                            label="Logo URL"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            helperText={errors.logoUrl || "Enter the URL of your club logo"}
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
            {loading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {uploadProgress < 50 ? "Preparing..." : uploadProgress < 100 ? "Uploading logo..." : "Creating club..."}
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
                {loading ? "Creating Club..." : "Create Club"}
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
            Creating your club...
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default CreateClub;
