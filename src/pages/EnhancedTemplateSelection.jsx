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
  Stack,
  Zoom,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Palette as PaletteIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import AppTheme from '../themes/AppTheme';
import { CssBaseline } from '@mui/material';

import env from '../config/environment';
// Enhanced Template Preview Component
const TemplatePreview = ({ template, isSelected, onSelect, onPreview }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Zoom in timeout={300}>
      <Card
        sx={{
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          boxShadow: hovered ? 8 : 2,
          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
          '&:hover': {
            boxShadow: 12,
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onPreview(template)}
      >
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <CheckCircleIcon color="primary" />
          </Box>
        )}
        
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
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(template);
              }}
            >
              Select
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

// Template Pack Card Component
const TemplatePackCard = ({ pack, isSelected, onSelect, onViewDetails }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? 12 : 4,
          border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
          overflow: 'hidden',
          '&:hover': {
            '& .pack-image': {
              transform: 'scale(1.05)',
            },
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
            }}
          >
            <CheckCircleIcon color="primary" sx={{ fontSize: 28 }} />
          </Box>
        )}

        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="250"
            image={pack.preview_image_url}
            alt={pack.name}
            className="pack-image"
            sx={{
              objectFit: 'cover',
              objectPosition: 'top center',
              transition: 'transform 0.3s ease',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: 2,
            }}
          >
            <Typography variant="h5" component="div" color="white" fontWeight="bold">
              {pack.name}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 0.5 }}>
              {pack.description}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaletteIcon color="primary" />
              <Typography variant="body2" color="text.secondary">
                {pack.templates_count || 0} Templates
              </Typography>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  backgroundColor: pack.primary_color || '#000000',
                  borderRadius: '50%',
                  border: '1px solid #e0e0e0',
                  ml: 1,
                }}
              />
            </Box>
            <Chip
              label={isSelected ? 'Selected' : 'Available'}
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<InfoIcon />}
              onClick={() => onViewDetails(pack)}
              fullWidth
            >
              View Details
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => onSelect(pack.id)}
              fullWidth
              disabled={isSelected}
            >
              {isSelected ? 'Selected' : 'Select Pack'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
};


// Main Enhanced Template Selection Component
export default function EnhancedTemplateSelection() {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [filteredPacks, setFilteredPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [sportFilter, setSportFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample packs for demonstration
  const samplePacks = [
    {
      id: 1,
      name: "Classic Football Pack",
      description: "Traditional football graphics with clean, professional design. Perfect for established clubs.",
      preview_image_url: "https://via.placeholder.com/400x250/1976d2/ffffff?text=Classic+Football+Pack",
      templates_count: 12,
      is_selected: false,
    },
    {
      id: 2,
      name: "Modern Sports Pack",
      description: "Contemporary design with bold colors and modern typography. Ideal for dynamic teams.",
      preview_image_url: "https://via.placeholder.com/400x250/388e3c/ffffff?text=Modern+Sports+Pack",
      templates_count: 15,
      is_selected: false,
    },
    {
      id: 3,
      name: "Premium Elite Pack",
      description: "High-end graphics with premium styling and effects. For professional organizations.",
      preview_image_url: "https://via.placeholder.com/400x250/ff9800/ffffff?text=Premium+Elite+Pack",
      templates_count: 18,
      is_selected: false,
    },
    {
      id: 4,
      name: "Minimalist Pack",
      description: "Clean, simple designs with focus on typography and whitespace. Modern and elegant.",
      preview_image_url: "https://via.placeholder.com/400x250/9c27b0/ffffff?text=Minimalist+Pack",
      templates_count: 10,
      is_selected: false,
    },
    {
      id: 5,
      name: "Vibrant Colors Pack",
      description: "Bold, energetic designs with vibrant colors and dynamic layouts. Perfect for youth teams.",
      preview_image_url: "https://via.placeholder.com/400x250/f44336/ffffff?text=Vibrant+Colors+Pack",
      templates_count: 14,
      is_selected: false,
    },
    {
      id: 6,
      name: "Corporate Pack",
      description: "Professional, business-focused designs suitable for corporate teams and sponsorships.",
      preview_image_url: "https://via.placeholder.com/400x250/607d8b/ffffff?text=Corporate+Pack",
      templates_count: 16,
      is_selected: false,
    },
  ];

  useEffect(() => {
    fetchPacks();
  }, []);

  // Filter packs based on sport and search term
  useEffect(() => {
    let filtered = packs;
    
    if (sportFilter) {
      filtered = filtered.filter(pack => 
        pack.sport && pack.sport.toLowerCase().includes(sportFilter.toLowerCase())
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(pack => 
        pack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pack.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPacks(filtered);
  }, [packs, sportFilter, searchTerm]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        "${env.API_BASE_URL}/graphicpack/graphic-packs/"
      );
      const data = Array.isArray(response.data) ? response.data : response.data.results;
      setPacks(data || []);
      setFilteredPacks(data || []);
    } catch (err) {
      console.error("Failed to load packs", err);
      
      if (err.response?.status === 404) {
        setError("Graphic packs endpoint not available. Using sample packs for demonstration.");
      } else {
        setError("Failed to load graphic packs. Using sample packs for demonstration.");
      }
      
      setPacks(samplePacks);
      setFilteredPacks(samplePacks);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPack = async (packId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "${env.API_BASE_URL}/graphicpack/select-pack/",
        { pack_id: packId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedPackId(packId);
      
      // Update the pack status to show it as selected
      setPacks(prevPacks => 
        prevPacks.map(pack => 
          pack.id === packId 
            ? { ...pack, is_selected: true }
            : { ...pack, is_selected: false }
        )
      );
      
      setFilteredPacks(prevPacks => 
        prevPacks.map(pack => 
          pack.id === packId 
            ? { ...pack, is_selected: true }
            : { ...pack, is_selected: false }
        )
      );
      
      setSnackbar({ 
        open: true, 
        message: "Template pack selected successfully!", 
        severity: "success" 
      });
      
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

  const handleViewDetails = (pack) => {
    navigate(`/gen/templates/${pack.id}`);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: 'background.default' }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.primary">
            Loading Template Packs...
          </Typography>
        </Box>
      </Box>
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
            mt: { xs: 12, md: 0 }, // Clear AppNavBar on mobile
          })}
        >
          <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mb: 2,
            }}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h3" component="h1" color="text.primary" fontWeight="bold" gutterBottom>
            Choose Your Template Pack
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Select a graphic template pack that matches your club's style and personality
          </Typography>
          
          {error && (
            <Alert severity="info" sx={{ mb: 3, backgroundColor: 'rgba(25,118,210,0.1)' }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search packs..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sport</InputLabel>
            <Select
              value={sportFilter}
              label="Sport"
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <MenuItem value="">All Sports</MenuItem>
              <MenuItem value="football">Football</MenuItem>
              <MenuItem value="basketball">Basketball</MenuItem>
              <MenuItem value="soccer">Soccer</MenuItem>
              <MenuItem value="tennis">Tennis</MenuItem>
              <MenuItem value="baseball">Baseball</MenuItem>
              <MenuItem value="hockey">Hockey</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {filteredPacks.length} pack{filteredPacks.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>

        {/* Template Packs Grid */}
        <Grid container spacing={4}>
          {filteredPacks.map((pack, index) => (
            <Grid item xs={12} sm={6} lg={4} key={pack.id}>
              <TemplatePackCard
                pack={pack}
                isSelected={selectedPackId === pack.id || pack.is_selected}
                onSelect={handleSelectPack}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>


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
