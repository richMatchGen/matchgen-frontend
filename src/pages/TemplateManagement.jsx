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
  Paper,
  Tooltip
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Cancel,
  Add,
  Refresh,
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [templateConfig, setTemplateConfig] = useState("");
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
      console.error("Error fetching user data:", error);
      setError("Failed to load user data");
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
      console.log('Fetching graphic pack with ID:', selectedPackId);
      const response = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/graphic-packs/${selectedPackId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Graphic pack response:', response.data);
      console.log('Templates in response:', response.data.templates);
      
      setSelectedGraphicPack(response.data);
      setTemplates(response.data.templates || []);
      
    } catch (error) {
      console.error("Error fetching graphic pack:", error);
      setError("Failed to load graphic pack. Please try again.");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchUserData(), fetchGraphicPack()]);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchUserData, fetchGraphicPack]);

  // Template editing functions
  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateConfig(JSON.stringify(template.template_config || {}, null, 2));
    setShowEditDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("accessToken");
      
      // Parse the JSON configuration
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(templateConfig);
      } catch (parseError) {
        setSnackbar({
          open: true,
          message: "Invalid JSON format. Please check your configuration.",
          severity: "error"
        });
        return;
      }

      // Update the template configuration
      const response = await axios.put(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/template-editor/${selectedTemplate.id}/`,
        { template_config: parsedConfig },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state
      const updatedTemplates = templates.map(t => 
        t.id === selectedTemplate.id 
          ? { ...t, template_config: parsedConfig }
          : t
      );
      setTemplates(updatedTemplates);

      setSnackbar({
        open: true,
        message: "Template configuration saved successfully!",
        severity: "success"
      });
      setShowEditDialog(false);
      
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

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setSelectedTemplate(null);
    setTemplateConfig("");
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Template Management" />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Template Management
                </Typography>
                {selectedGraphicPack && (
                  <Typography variant="body1" color="text.secondary">
                    Managing templates for: <strong>{selectedGraphicPack.name}</strong>
                  </Typography>
                )}
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
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("accessToken");
                      const response = await axios.get(
                        `https://matchgen-backend-production.up.railway.app/api/graphicpack/debug-templates/?pack_id=${selectedGraphicPack?.id || 7}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      console.log('Debug Templates Response:', response.data);
                      setSnackbar({
                        open: true,
                        message: `Debug info logged to console. Templates: ${response.data.templates_count}, All: ${response.data.all_templates_count}`,
                        severity: "info"
                      });
                    } catch (error) {
                      console.error('Debug error:', error);
                      setSnackbar({
                        open: true,
                        message: `Debug failed: ${error.message}`,
                        severity: "error"
                      });
                    }
                  }}
                >
                  Debug
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("accessToken");
                      const response = await axios.get(
                        `https://matchgen-backend-production.up.railway.app/api/graphicpack/test-graphic-pack-detail/?pack_id=${selectedGraphicPack?.id || 8}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      console.log('Test Graphic Pack Detail Response:', response.data);
                      setSnackbar({
                        open: true,
                        message: `Test detail logged to console. Templates: ${response.data.templates_count}`,
                        severity: "info"
                      });
                    } catch (error) {
                      console.error('Test detail error:', error);
                      setSnackbar({
                        open: true,
                        message: `Test detail failed: ${error.message}`,
                        severity: "error"
                      });
                    }
                  }}
                >
                  Test Detail
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Add />}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("accessToken");
                      const response = await axios.post(
                        "https://matchgen-backend-production.up.railway.app/api/graphicpack/create-missing-templates/",
                        {},
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      console.log('Create Missing Templates Response:', response.data);
                      setSnackbar({
                        open: true,
                        message: response.data.message,
                        severity: "success"
                      });
                      
                      // Refresh the data to show the new templates
                      setTimeout(() => {
                        setLoading(true);
                        Promise.all([
                          fetchUserData(),
                          fetchGraphicPack()
                        ]).finally(() => setLoading(false));
                      }, 1000);
                    } catch (error) {
                      console.error('Create missing templates error:', error);
                      setSnackbar({
                        open: true,
                        message: `Failed to create templates: ${error.response?.data?.error || error.message}`,
                        severity: "error"
                      });
                    }
                  }}
                >
                  Create Missing Templates
                </Button>
              </Box>
            </Box>

            {/* Templates Grid */}
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {template.content_type}
                        </Typography>
                        <Chip 
                          label={`${Object.keys(template.template_config?.elements || {}).length} elements`}
                          size="small"
                          color="primary"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Template ID: {template.id}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleEditTemplate(template)}
                        >
                          Edit Configuration
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {templates.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No templates found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click "Create Missing Templates" to generate default templates for this graphic pack.
                </Typography>
              </Paper>
            )}
          </Container>
        </Box>
      </Box>

      {/* Edit Template Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Template Configuration: {selectedTemplate?.content_type}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Edit the JSON configuration for this template. The configuration defines the position and styling of text elements.
          </Typography>
          <TextField
            multiline
            rows={20}
            fullWidth
            value={templateConfig}
            onChange={(e) => setTemplateConfig(e.target.value)}
            placeholder="Enter JSON configuration..."
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppTheme>
  );
};

export default TemplateManagement;
