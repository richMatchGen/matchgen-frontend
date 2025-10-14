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
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CssBaseline,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  SportsSoccer as OpponentIcon,
  LocationOn as VenueIcon,
  AccessTime as TimeIcon,
  CalendarToday as DateIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  FlightTakeoff as AwayIcon,
  Add as AddIcon,
  List as ListIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FeatureRestrictedButton from "../components/FeatureRestrictedButton";

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

// Match type options
const matchTypeOptions = [
  { value: "league", label: "League", icon: <EventIcon />, color: "#1976d2" },
  { value: "cup", label: "Cup", icon: <EventIcon />, color: "#388e3c" },
  { value: "friendly", label: "Friendly", icon: <EventIcon />, color: "#f57c00" },
  { value: "playoff", label: "Playoff", icon: <EventIcon />, color: "#7b1fa2" },
  { value: "championship", label: "Championship", icon: <EventIcon />, color: "#d32f2f" },
  { value: "exhibition", label: "Exhibition", icon: <EventIcon />, color: "#1976d2" },
  { value: "other", label: "Other", icon: <EventIcon />, color: "#757575" },
];

// Home/Away options
const homeAwayOptions = [
  { value: "HOME", label: "Home Fixture", icon: <HomeIcon />, color: "black" },
  { value: "AWAY", label: "Away Fixture", icon: <AwayIcon />, color: "black" },
];

// Form steps for better UX
const formSteps = [
  { label: "Match Details", description: "Type, opponent, and fixture type" },
  { label: "Date & Time", description: "When and where" },
  { label: "Venue", description: "Location details" },
];

const CreateMatch = ({ onFixtureAdded }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    match_type: "League",
    opponent: "",
    home_away: "HOME",
    date: null,
    time_start: "",
    venue: "",
    location: "",
  });
  
  // UI state
  const [opponentLogoFile, setOpponentLogoFile] = useState(null);
  const [opponentLogoPreview, setOpponentLogoPreview] = useState(null);
  const [opponentLogoUrl, setOpponentLogoUrl] = useState("");
  const [useOpponentLogoUrl, setUseOpponentLogoUrl] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userClub, setUserClub] = useState(null);
  
  // Tab and fixtures state
  const [activeTab, setActiveTab] = useState(0);
  const [fixtures, setFixtures] = useState([]);
  const [fixturesLoading, setFixturesLoading] = useState(false);

  // Fetch fixtures function
  const fetchFixtures = useCallback(async () => {
    setFixturesLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get(
        "https://matchgen-backend-production.up.railway.app/api/content/matches/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Fixtures API response:", response.data);
      
      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          setFixtures(response.data);
        } else if (response.data.results && Array.isArray(response.data.results)) {
          setFixtures(response.data.results);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setFixtures(response.data.data);
        } else {
          console.warn("Unexpected fixtures response structure:", response.data);
          setFixtures([]);
        }
      } else {
        setFixtures([]);
      }
    } catch (err) {
      console.warn("Could not fetch fixtures:", err);
      setFixtures([]);
    } finally {
      setFixturesLoading(false);
    }
  }, []);

  // Fetch user's club and fixtures on component mount
  useEffect(() => {
    const fetchUserClub = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/my-club/",
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
    fetchFixtures();
  }, [fetchFixtures]);

  // Memoized values for performance
  const isFormValid = useMemo(() => {
    return formData.match_type.trim() && formData.opponent.trim() && formData.date && formData.time_start.trim() && formData.venue.trim() && Object.keys(errors).length === 0;
  }, [formData, errors]);

  const formProgress = useMemo(() => {
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim()).length;
    return Math.min((filledFields / Object.keys(formData).length) * 100, 100);
  }, [formData]);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Required fields
    if (!formData.match_type.trim()) {
      newErrors.match_type = "Match type is required";
    }
    
    if (!formData.opponent.trim()) {
      newErrors.opponent = "Opponent is required";
    } else if (formData.opponent.trim().length < 2) {
      newErrors.opponent = "Opponent name must be at least 2 characters";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    if (!formData.time_start.trim()) {
      newErrors.time_start = "Time is required";
    }
    
    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required";
    }

    if (useOpponentLogoUrl && opponentLogoUrl && !isValidUrl(opponentLogoUrl)) {
      newErrors.opponentLogoUrl = "Please enter a valid opponent logo URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, useOpponentLogoUrl, opponentLogoUrl]);

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
    if (activeStep === 0 && field === 'opponent' && value && formData.match_type.trim()) {
      setTimeout(() => setActiveStep(1), 500);
    }
  }, [errors, activeStep, formData.match_type]);

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

      setOpponentLogoFile(file);
      setOpponentLogoPreview(URL.createObjectURL(file));
      setError("");
      setSnackbar({
        open: true,
        message: "Opponent logo selected successfully!",
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
    setOpponentLogoFile(null);
    setOpponentLogoPreview(null);
    setOpponentLogoUrl("");
    setUseOpponentLogoUrl(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSnackbar({
      open: true,
      message: "Opponent logo removed",
      severity: "info"
    });
  }, []);

  // Silent logo removal for form reset (no snackbar)
  const handleRemoveLogoSilent = useCallback(() => {
    setOpponentLogoFile(null);
    setOpponentLogoPreview(null);
    setOpponentLogoUrl("");
    setUseOpponentLogoUrl(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      setError("You must be logged in to create a match.");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Prepare the data
      const matchData = {
        match_type: formData.match_type.trim(),
        opponent: formData.opponent.trim(),
        home_away: formData.home_away,
        date: formData.date?.toISOString(), // Send full datetime ISO string
        time_start: formData.time_start.trim(),
        venue: formData.venue.trim(),
        location: formData.location.trim() || null,
      };

      // Handle opponent logo with progress tracking
      if (useOpponentLogoUrl && opponentLogoUrl) {
        matchData.opponent_logo = opponentLogoUrl;
        setUploadProgress(100);
      } else if (opponentLogoFile) {
        // Upload file to backend and get URL
        try {
          setUploadProgress(25);
          
          const formData = new FormData();
          formData.append('logo', opponentLogoFile);
          
          const uploadResponse = await axios.post(
            "https://matchgen-backend-production.up.railway.app/api/content/matches/upload-opponent-logo/",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          
          setUploadProgress(75);
          matchData.opponent_logo = uploadResponse.data.logo_url;
          setUploadProgress(100);
          
          setSnackbar({
            open: true,
            message: "Opponent logo uploaded successfully!",
            severity: "success"
          });
        } catch (uploadError) {
          console.error("Logo upload failed:", uploadError);
          setSnackbar({
            open: true,
            message: "Failed to upload opponent logo. Creating match without logo.",
            severity: "warning"
          });
          // Continue without logo
        }
      }

      // Remove null/empty values to avoid validation issues
      Object.keys(matchData).forEach(key => {
        if (matchData[key] === null || matchData[key] === "") {
          delete matchData[key];
        }
      });

      console.log("Sending match data:", matchData);
      console.log("API endpoint:", "https://matchgen-backend-production.up.railway.app/api/content/matches/");
      console.log("Authorization header:", `Bearer ${token}`);

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
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if the response is successful
      if (response.status >= 200 && response.status < 300) {
        if (response.data && (response.data.id || response.data.opponent)) {
          console.log("✅ Match created successfully with data:", response.data);
          setSuccess("Match created successfully!");
          setSnackbar({
            open: true,
            message: "Match created successfully!",
            severity: "success"
          });
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
          setSuccess("Match created successfully!");
          setSnackbar({
            open: true,
            message: "Match created successfully!",
            severity: "success"
          });
        }
      } else {
        console.error("❌ Non-success status code:", response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Call the callback if provided
      if (onFixtureAdded) {
        onFixtureAdded(response.data);
      }
      
      // Enhanced form reset
      setFormData({
        match_type: "League",
        opponent: "",
        home_away: "HOME",
        date: null,
        time_start: "",
        venue: "",
        location: "",
      });
      setOpponentLogoUrl("");
      setUseOpponentLogoUrl(false);
      handleRemoveLogoSilent();
      setActiveStep(0);
      
      // Refresh fixtures list but stay on create tab
      await fetchFixtures();
      
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
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [validateForm, useOpponentLogoUrl, opponentLogoUrl, opponentLogoFile, formData, navigate, handleRemoveLogoSilent, onFixtureAdded, fetchFixtures]);

  // Close snackbar
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Tab change handler
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 1) {
      fetchFixtures();
    }
  }, [fetchFixtures]);

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
            mt: { xs: 12, md: 0 }, // Clear AppNavBar on mobile
          })}
        >
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
                Fixtures Management
              </Typography>
            </Fade>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
              Create new fixtures and manage your existing matches.
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="fixtures tabs">
              <Tab 
                icon={<AddIcon />} 
                label="Create Fixture" 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab 
                icon={<ListIcon />} 
                label={`Fixtures (${Array.isArray(fixtures) ? fixtures.length : 0})`} 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <>
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
                Creating match for: <strong>{userClub.name}</strong>
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
            {/* Left Column - Match Details */}
            <Grid item xs={12} md={6}>
              <Zoom in timeout={600}>
                <StyledCard isActive={activeStep === 0}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                      Match Details
                    </Typography>
                    
                    <Stack spacing={3}>
                      {/* Enhanced Match Type field */}
                      <FormControl fullWidth required error={!!errors.match_type}>
                        <InputLabel>Match Type</InputLabel>
                        <Select
                          value={formData.match_type}
                          onChange={(e) => handleInputChange("match_type", e.target.value)}
                          label="Match Type"
                          startAdornment={
                            <InputAdornment position="start">
                              <EventIcon color="action" />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="League">League</MenuItem>
                          <MenuItem value="Cup">Cup</MenuItem>
                          <MenuItem value="Friendly">Friendly</MenuItem>
                          <MenuItem value="Playoff">Playoff</MenuItem>
                          <MenuItem value="Championship">Championship</MenuItem>
                          <MenuItem value="Exhibition">Exhibition</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {errors.match_type && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                            {errors.match_type}
                          </Typography>
                        )}
                      </FormControl>

                      {/* Enhanced Opponent field */}
                      <TextField
                        fullWidth
                        label="Opponent"
                        value={formData.opponent}
                        onChange={(e) => handleInputChange("opponent", e.target.value)}
                        error={!!errors.opponent}
                        helperText={errors.opponent || "e.g., Manchester United"}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <OpponentIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {/* Enhanced Home/Away Selection */}
                      <FormControl fullWidth required>
                        <InputLabel>Fixture Type</InputLabel>
                        <Select
                          value={formData.home_away}
                          onChange={(e) => handleInputChange("home_away", e.target.value)}
                          label="Fixture Type"
                        >
                          {homeAwayOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ color: option.color }}>
                                  {option.icon}
                                </Box>
                                {option.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </CardContent>
                </StyledCard>
              </Zoom>
            </Grid>

            {/* Right Column - Date, Time & Venue */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Enhanced Date & Time */}
                <Zoom in timeout={800}>
                  <StyledCard isActive={activeStep === 1}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                        Date & Time
                      </Typography>
                      
                      <Stack spacing={3}>
                        {/* Enhanced Date Picker */}
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Match Date *"
                            value={formData.date}
                            onChange={(newDate) => handleInputChange("date", newDate)}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                fullWidth 
                                error={!!errors.date}
                                helperText={errors.date || "Select the match date"}
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <DateIcon color="action" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>

                        {/* Enhanced Time field */}
                        <TextField
                          fullWidth
                          label="Start Time"
                          value={formData.time_start}
                          onChange={(e) => handleInputChange("time_start", e.target.value)}
                          error={!!errors.time_start}
                          helperText={errors.time_start || "e.g., 15:00"}
                          required
                          placeholder="15:00"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <TimeIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Zoom>

                {/* Enhanced Venue Information */}
                <Zoom in timeout={1000}>
                  <StyledCard isActive={activeStep === 2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                        Venue Information
                      </Typography>
                      
                      <Stack spacing={3}>
                        {/* Enhanced Venue field */}
                        <TextField
                          fullWidth
                          label="Venue"
                          value={formData.venue}
                          onChange={(e) => handleInputChange("venue", e.target.value)}
                          error={!!errors.venue}
                          helperText={errors.venue || "e.g., Old Trafford"}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <VenueIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />

                        {/* Enhanced Location field */}
                        <TextField
                          fullWidth
                          label="Location"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          placeholder="e.g., Manchester, UK"
                          helperText="Optional"
                        />
                      </Stack>
                    </CardContent>
                  </StyledCard>
                </Zoom>

                {/* Enhanced Opponent Logo Upload */}
                <Zoom in timeout={1200}>
                  <StyledCard isActive={activeStep === 2}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
                        Opponent Logo
                      </Typography>
                      
                      {/* Opponent Logo Upload Options */}
                      <Stack spacing={2}>
                        {/* Enhanced toggle between file upload and URL */}
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                          <Button
                            variant={!useOpponentLogoUrl ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setUseOpponentLogoUrl(false)}
                            startIcon={<CloudUploadIcon />}
                          >
                            Upload File
                          </Button>
                          {/* <Button
                            variant={useOpponentLogoUrl ? "contained" : "outlined"}
                            size="small"
                            onClick={() => setUseOpponentLogoUrl(true)}
                            startIcon={<OpponentIcon />}
                          >
                            Use URL
                          </Button> */}
                        </Box>

                        {useOpponentLogoUrl ? (
                          // Enhanced Opponent Logo URL Input
                          <TextField
                            fullWidth
                            label="Opponent Logo URL"
                            value={opponentLogoUrl}
                            onChange={(e) => setOpponentLogoUrl(e.target.value)}
                            placeholder="https://example.com/opponent-logo.png"
                            helperText={errors.opponentLogoUrl || "Enter the URL of the opponent logo"}
                            error={!!errors.opponentLogoUrl}
                          />
                        ) : (
                          // Enhanced File Upload
                          <>
                            {opponentLogoPreview ? (
                              <Box textAlign="center">
                                <Avatar
                                  src={opponentLogoPreview}
                                  alt="Opponent logo preview"
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
                                hasError={!!errors.opponentLogoUrl}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                  Upload Opponent Logo
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
                  {uploadProgress < 50 ? "Preparing..." : uploadProgress < 100 ? "Uploading logo..." : "Creating match..."}
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
                {loading ? "Creating Match..." : "Create Match"}
              </Button>
            </Stack>
          </Box>
            </>
          )}

          {/* Fixtures Tab Content */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Your Fixtures ({Array.isArray(fixtures) ? fixtures.length : 0})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchFixtures}
                  disabled={fixturesLoading}
                >
                  Refresh
                </Button>
              </Box>

              {fixturesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : !Array.isArray(fixtures) || fixtures.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No fixtures found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first fixture to get started.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setActiveTab(0)}
                  >
                    Create First Fixture
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Match Type</TableCell>
                        <TableCell>Opponent</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Venue</TableCell>
                        <TableCell>Home/Away</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(fixtures) && fixtures.map((fixture) => (
                        <TableRow key={fixture.id} hover>
                          <TableCell>
                            <Chip 
                              label={fixture.match_type || 'N/A'} 
                              color="primary" 
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {fixture.opponent_logo && (
                                <Avatar 
                                  src={fixture.opponent_logo} 
                                  sx={{ width: 24, height: 24 }}
                                />
                              )}
                              <Typography variant="body2">
                                {fixture.opponent || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fixture.date ? new Date(fixture.date).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fixture.time_start || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {fixture.venue || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={fixture.home_away || 'N/A'} 
                              color={fixture.home_away === 'HOME' ? 'success' : 'warning'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No fixtures data available
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
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
            Creating your match...
          </Typography>
        </Box>
      </Backdrop>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default CreateMatch;