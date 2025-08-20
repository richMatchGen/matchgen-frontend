import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Box,
  CssBaseline,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Tooltip
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Add,
  Delete,
  Refresh,
  Settings,
  Palette,
  TextFields,
  CropFree,
  Download,
  Upload,
  CheckCircle,
  Error,
  Warning,
  Info
} from "@mui/icons-material";
import AppTheme from "../themes/AppTheme";
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const TemplateManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [user, setUser] = useState(null);
  const [selectedGraphicPack, setSelectedGraphicPack] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  
  // Template editing state
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);

  // Data fetching
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const userRes = await axios.get("https://matchgen-backend-production.up.railway.app/api/users/me/", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUser(userRes.data);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }, []);

  const fetchGraphicPack = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      
      // Get user's club to find selected graphic pack
      let selectedPackId = null;
      try {
        const myClubResponse = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/my-club/",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (myClubResponse.data && myClubResponse.data.selected_pack) {
          selectedPackId = myClubResponse.data.selected_pack;
        }
      } catch (clubError) {
        console.error("Error fetching club:", clubError);
      }
      
      if (!selectedPackId) {
        setError("No graphic pack selected. Please select a graphic pack first.");
        return;
      }
      
      // Fetch the full graphic pack with templates
      const response = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/graphic-packs/${selectedPackId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedGraphicPack(response.data);
      setTemplates(response.data.templates || []);
      
    } catch (error) {
      console.error("Error fetching graphic pack:", error);
      setError("Failed to load graphic pack. Please try again.");
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchUserData(),
          fetchGraphicPack()
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchUserData, fetchGraphicPack]);

  // Template editing functions
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setEditingTemplate(JSON.parse(JSON.stringify(template))); // Deep copy
    setShowEditDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.put(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/template/${editingTemplate.id}/edit/`,
        { elements: editingTemplate.elements },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      
      setSnackbar({
        open: true,
        message: "Template updated successfully!",
        severity: "success"
      });
      
      setShowEditDialog(false);
      setEditingTemplate(null);
      setSelectedTemplate(null);
      
    } catch (error) {
      console.error("Error saving template:", error);
      setSnackbar({
        open: true,
        message: `Failed to save template: ${error.response?.data?.error || error.message}`,
        severity: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingTemplate(null);
    setSelectedTemplate(null);
  };

  const updateElement = (elementId, field, value) => {
    if (!editingTemplate) return;
    
    setEditingTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, [field]: value } : el
      )
    }));
  };

  const updateStringElement = (elementId, stringElementId, field, value) => {
    if (!editingTemplate) return;
    
    setEditingTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? {
          ...el,
          string_elements: el.string_elements.map(se => 
            se.id === stringElementId ? { ...se, [field]: value } : se
          )
        } : el
      )
    }));
  };

  const toggleElementVisibility = (elementId) => {
    if (!editingTemplate) return;
    
    setEditingTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === elementId ? { ...el, visible: !el.visible } : el
      )
    }));
  };

  const getContentTypeLabel = (contentType) => {
    const labels = {
      'matchday': 'Matchday',
      'upcomingFixture': 'Upcoming Fixture',
      'startingXI': 'Starting XI',
      'goal': 'Goal Celebration',
      'sub': 'Substitution',
      'halftime': 'Halftime Score',
      'fulltime': 'Full-time Result'
    };
    return labels[contentType] || contentType;
  };

  const getContentTypeColor = (contentType) => {
    const colors = {
      'matchday': 'primary',
      'upcomingFixture': 'info',
      'startingXI': 'secondary',
      'goal': 'success',
      'sub': 'warning',
      'halftime': 'info',
      'fulltime': 'error'
    };
    return colors[contentType] || 'default';
  };

  if (loading) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress size={60} />
        </Box>
      </AppTheme>
    );
  }

  if (error) {
    return (
      <AppTheme>
        <CssBaseline enableColorScheme />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Card sx={{ p: 4, maxWidth: 400 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Error Loading Data
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              fullWidth
            >
              Retry
            </Button>
          </Card>
        </Box>
      </AppTheme>
    );
  }

  if (!user) return null;

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
              : theme.palette.background.default,
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <Container sx={{ py: 4, width: '100%' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={() => navigate('/gen/posts')}
                    sx={{ mr: 2 }}
                  >
                    <ArrowBack />
                  </IconButton>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      Template Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Configure text positions, fonts, and styling for your templates
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => {
                      setLoading(true);
                      Promise.all([
                        fetchUserData(),
                        fetchGraphicPack()
                      ]).finally(() => setLoading(false));
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Box>

              {/* Graphic Pack Info */}
              {selectedGraphicPack && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                          {selectedGraphicPack.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedGraphicPack.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Templates
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {templates.length}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Templates List */}
              {templates.length > 0 ? (
                <Grid container spacing={3}>
                  {templates.map((template) => (
                    <Grid item xs={12} md={6} lg={4} key={template.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 3 }
                        }}
                        onClick={() => handleEditTemplate(template)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" gutterBottom>
                              {getContentTypeLabel(template.content_type)}
                            </Typography>
                            <Chip 
                              label={getContentTypeLabel(template.content_type)}
                              color={getContentTypeColor(template.content_type)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Template ID: {template.id}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Elements: {template.elements?.length || 0}
                          </Typography>
                          
                          {template.sport && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Sport: {template.sport}
                            </Typography>
                          )}
                          
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<Edit />}
                              fullWidth
                            >
                              Edit Template
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Templates Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      This graphic pack doesn't have any templates configured yet.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        setSnackbar({
                          open: true,
                          message: "Template creation feature coming soon!",
                          severity: "info"
                        });
                      }}
                    >
                      Create Template
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Template Edit Dialog */}
              <Dialog 
                open={showEditDialog} 
                onClose={handleCancelEdit}
                maxWidth="xl"
                fullWidth
              >
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Edit Template: {selectedTemplate && getContentTypeLabel(selectedTemplate.content_type)}
                    </Typography>
                    <IconButton onClick={handleCancelEdit}>
                      <Cancel />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  {editingTemplate && (
                    <Box sx={{ mt: 2 }}>
                      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        <Tab label="Elements" />
                        <Tab label="Preview" />
                      </Tabs>
                      
                      <Box sx={{ mt: 2 }}>
                        {activeTab === 0 && (
                          <Grid container spacing={2}>
                            {editingTemplate.elements?.map((element) => (
                              <Grid item xs={12} key={element.id}>
                                <Accordion>
                                  <AccordionSummary>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                      <Typography variant="subtitle1">
                                        {element.content_key || `Element ${element.id}`}
                                      </Typography>
                                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                        <FormControlLabel
                                          control={
                                            <Switch
                                              checked={element.visible}
                                              onChange={() => toggleElementVisibility(element.id)}
                                            />
                                          }
                                          label="Visible"
                                        />
                                        <Chip 
                                          label={element.type}
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      </Box>
                                    </Box>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <Grid container spacing={2}>
                                      {/* Position */}
                                      <Grid item xs={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Position
                                        </Typography>
                                        <TextField
                                          label="X"
                                          type="number"
                                          value={element.x}
                                          onChange={(e) => updateElement(element.id, 'x', parseFloat(e.target.value))}
                                          fullWidth
                                          size="small"
                                          sx={{ mb: 1 }}
                                        />
                                        <TextField
                                          label="Y"
                                          type="number"
                                          value={element.y}
                                          onChange={(e) => updateElement(element.id, 'y', parseFloat(e.target.value))}
                                          fullWidth
                                          size="small"
                                        />
                                      </Grid>
                                      
                                      {/* Size */}
                                      <Grid item xs={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Size
                                        </Typography>
                                        <TextField
                                          label="Width"
                                          type="number"
                                          value={element.width || ''}
                                          onChange={(e) => updateElement(element.id, 'width', parseFloat(e.target.value))}
                                          fullWidth
                                          size="small"
                                          sx={{ mb: 1 }}
                                        />
                                        <TextField
                                          label="Height"
                                          type="number"
                                          value={element.height || ''}
                                          onChange={(e) => updateElement(element.id, 'height', parseFloat(e.target.value))}
                                          fullWidth
                                          size="small"
                                        />
                                      </Grid>
                                      
                                      {/* Text Elements */}
                                      {element.type === 'text' && element.string_elements?.map((stringElement) => (
                                        <Grid item xs={12} key={stringElement.id}>
                                          <Divider sx={{ my: 2 }} />
                                          <Typography variant="subtitle2" gutterBottom>
                                            Text Styling
                                          </Typography>
                                          <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                              <TextField
                                                label="Font Family"
                                                value={stringElement.font_family || ''}
                                                onChange={(e) => updateStringElement(element.id, stringElement.id, 'font_family', e.target.value)}
                                                fullWidth
                                                size="small"
                                              />
                                            </Grid>
                                            <Grid item xs={6}>
                                              <TextField
                                                label="Font Size"
                                                type="number"
                                                value={stringElement.font_size || ''}
                                                onChange={(e) => updateStringElement(element.id, stringElement.id, 'font_size', parseInt(e.target.value))}
                                                fullWidth
                                                size="small"
                                              />
                                            </Grid>
                                            <Grid item xs={6}>
                                              <TextField
                                                label="Color"
                                                value={stringElement.color || ''}
                                                onChange={(e) => updateStringElement(element.id, stringElement.id, 'color', e.target.value)}
                                                fullWidth
                                                size="small"
                                              />
                                            </Grid>
                                            <Grid item xs={6}>
                                              <FormControl fullWidth size="small">
                                                <InputLabel>Alignment</InputLabel>
                                                <Select
                                                  value={stringElement.alignment || 'left'}
                                                  onChange={(e) => updateStringElement(element.id, stringElement.id, 'alignment', e.target.value)}
                                                  label="Alignment"
                                                >
                                                  <MenuItem value="left">Left</MenuItem>
                                                  <MenuItem value="center">Center</MenuItem>
                                                  <MenuItem value="right">Right</MenuItem>
                                                </Select>
                                              </FormControl>
                                            </Grid>
                                          </Grid>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </AccordionDetails>
                                </Accordion>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                        
                        {activeTab === 1 && (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              Preview Coming Soon
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Live preview of template changes will be available in the next update.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveTemplate} 
                    variant="contained"
                    startIcon={<Save />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Snackbar */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
              >
                <Alert
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  severity={snackbar.severity}
                  sx={{ width: "100%" }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </Container>
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default TemplateManagement;
