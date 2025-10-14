import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
  IconButton,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
  CheckCircle as CheckCircleIcon,
  Palette as PaletteIcon,
  Home as HomeIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import AppTheme from '../themes/AppTheme';
import { CssBaseline } from '@mui/material';
import useClubSingleton from '../hooks/useClubSingleton';
import { alpha } from '@mui/material/styles';

// Template Preview Component
const TemplatePreview = ({ template, onSelect, onPreview }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      sx={{
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: hovered ? 8 : 2,
        '&:hover': {
          boxShadow: 12,
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPreview(template)}
    >
      <CardMedia
        component="img"
        height="200"
        image={template.image_url}
        alt={template.content_type}
        sx={{
          objectFit: 'cover',
          filter: hovered ? 'brightness(1.1)' : 'brightness(1)',
          transition: 'filter 0.3s ease',
        }}
      />
      
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div" noWrap>
            {template.content_type.replace(/([A-Z])/g, ' $1').trim()}
          </Typography>
          <Chip
            label={template.sport || 'All Sports'}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Stack>
        
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            startIcon={<PreviewIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
          >
            Preview
          </Button>
          {/* <Button
            size="small"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            Select
          </Button> */}
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Template Details Component
export default function TemplateDetails() {
  const navigate = useNavigate();
  const { packId } = useParams();
  const { refreshClub } = useClubSingleton();
  const [pack, setPack] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    if (packId) {
      fetchTemplates();
    }
  }, [packId]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      const response = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/templates/${packId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setPack(response.data.pack);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to load templates. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSelectTemplate = (template) => {
    // Handle template selection logic here
    console.log('Selected template:', template);
    setSnackbar({
      open: true,
      message: `Selected ${template.content_type} template`,
      severity: 'success'
    });
  };

  const handlePreviewTemplate = (template) => {
    setPreviewTemplate(template);
    setPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewModalOpen(false);
    setPreviewTemplate(null);
  };

  const handleSelectPack = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/graphicpack/select-pack/",
        { pack_id: packId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({ 
        open: true, 
        message: "Template pack selected successfully!", 
        severity: "success" 
      });
      
      // Refresh club data to update the todo list
      await refreshClub();
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error("Error selecting pack", err);
      setSnackbar({ 
        open: true, 
        message: "Failed to select template pack. Please try again.", 
        severity: "error" 
      });
    }
  };

  const contentTypes = [...new Set(templates.map(t => t.content_type))];

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">
            Loading Templates...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/gen/templates')}
        >
          Back to Template Packs
        </Button>
      </Container>
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
          <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/gen/templates')}
          >
            Template Packs
          </Link>
          <Typography color="text.primary">{pack?.name}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/gen/templates')}
            sx={{ mb: 2 }}
          >
            Back to Template Packs
          </Button>
          
          <Typography variant="h3" component="h1" color="text.primary" fontWeight="bold" gutterBottom>
            {pack?.name}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {pack?.description}
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Chip
              icon={<PaletteIcon />}
              label={`${templates.length} Templates`}
              color="primary"
              variant="outlined"
            />
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleSelectPack}
              size="large"
            >
              Select This Pack
            </Button>
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Templates" />
            {contentTypes.map((type) => (
              <Tab
                key={type}
                label={type.replace(/([A-Z])/g, ' $1').trim()}
              />
            ))}
          </Tabs>
        </Box>

        {/* Templates Grid */}
        <Grid container spacing={3}>
          {templates
            .filter(template => 
              selectedTab === 0 || template.content_type === contentTypes[selectedTab - 1]
            )
            .map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <TemplatePreview
                  template={template}
                  onSelect={handleSelectTemplate}
                  onPreview={handlePreviewTemplate}
                />
              </Grid>
            ))}
        </Grid>

        {templates.length === 0 && (
          <Alert severity="info" sx={{ mt: 3 }}>
            No templates found for this pack.
          </Alert>
        )}

        {/* Template Preview Modal */}
        <Dialog
          open={previewModalOpen}
          onClose={handleClosePreview}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ZoomInIcon color="primary" />
              <Typography variant="h6" component="div">
                {previewTemplate?.content_type?.replace(/([A-Z])/g, ' $1').trim()}
              </Typography>
            </Box>
            <IconButton onClick={handleClosePreview} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0 }}>
            {previewTemplate && (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <img
                  src={previewTemplate.image_url}
                  alt={previewTemplate.content_type}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    backgroundPosition: 'top',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                />
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Chip
                      label={previewTemplate.sport || 'All Sports'}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      label={previewTemplate.content_type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ 
            borderTop: '1px solid',
            borderColor: 'divider',
            p: 2,
            gap: 1
          }}>
            <Button onClick={handleClosePreview} color="inherit">
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (previewTemplate) {
                  handleSelectTemplate(previewTemplate);
                }
                handleClosePreview();
              }}
              startIcon={<CheckCircleIcon />}
            >
              Select This Template
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        {snackbar.open && (
          <Alert
            severity={snackbar.severity}
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 9999,
            }}
            onClose={() => setSnackbar({ open: false, message: "", severity: "info" })}
          >
            {snackbar.message}
          </Alert>
        )}
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
}
