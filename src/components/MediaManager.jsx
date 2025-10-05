import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Fab,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  PhotoLibrary as PhotoIcon,
  SportsSoccer as LogoIcon,
  Description as TemplateIcon,
  Wallpaper as BackgroundIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/config';

const MediaManager = () => {
  const { auth } = useAuth();
  const token = auth.token;
  
  // State management
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Upload form state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadMediaType, setUploadMediaType] = useState('');
  const [uploadTags, setUploadTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Filter and search state
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMediaType, setFilterMediaType] = useState('');
  
  // Stats state
  const [stats, setStats] = useState(null);
  
  // Media type options
  const mediaTypes = [
    { value: 'club_logo', label: 'Club Logo', icon: <LogoIcon /> },
    { value: 'opponent_logo', label: 'Opponent Logo', icon: <LogoIcon /> },
    { value: 'player_photo', label: 'Player Photo', icon: <PhotoIcon /> },
    { value: 'template', label: 'Template', icon: <TemplateIcon /> },
    { value: 'background', label: 'Background', icon: <BackgroundIcon /> },
    { value: 'banner', label: 'Banner', icon: <BackgroundIcon /> },
    { value: 'other', label: 'Other', icon: <PhotoIcon /> }
  ];
  
  // Category options
  const categories = [
    { value: 'logos', label: 'Logos' },
    { value: 'players', label: 'Player Photos' },
    { value: 'templates', label: 'Templates' },
    { value: 'backgrounds', label: 'Backgrounds' },
    { value: 'banners', label: 'Banners' },
    { value: 'other', label: 'Other' }
  ];
  
  // Tab options
  const tabs = [
    { label: 'All Media', value: 'all' },
    { label: 'Logos', value: 'logos' },
    { label: 'Players', value: 'players' },
    { label: 'Templates', value: 'templates' },
    { label: 'Backgrounds', value: 'backgrounds' }
  ];
  
  // Load media items
  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (filterMediaType) params.append('media_type', filterMediaType);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await apiClient.get(`graphicpack/media/?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMediaItems(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load media items');
      console.error('Error fetching media items:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load stats
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('graphicpack/media/stats/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };
  
  // Initial load
  useEffect(() => {
    if (token) {
      fetchMediaItems();
      fetchStats();
    }
  }, [token, filterCategory, filterMediaType, searchTerm]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const tabValue = tabs[newValue].value;
    if (tabValue === 'all') {
      setFilterCategory('');
    } else {
      setFilterCategory(tabValue);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.split('.')[0]); // Use filename without extension as default title
    }
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile || !uploadMediaType) {
      setError('Please select a file and media type');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('media_type', uploadMediaType);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      formData.append('tags', JSON.stringify(uploadTags));
      
      const response = await apiClient.post('graphicpack/media/upload/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Media uploaded successfully!');
      setUploadDialogOpen(false);
      resetUploadForm();
      fetchMediaItems();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload media');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };
  
  // Reset upload form
  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadMediaType('');
    setUploadTags([]);
    document.getElementById('file-input').value = '';
  };
  
  // Handle delete
  const handleDelete = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await apiClient.delete(`graphicpack/media/${mediaId}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Media deleted successfully');
        fetchMediaItems();
        fetchStats();
      } catch (err) {
        setError('Failed to delete media');
        console.error('Delete error:', err);
      }
    }
  };
  
  // Handle edit
  const handleEdit = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setEditDialogOpen(true);
  };
  
  // Handle view
  const handleView = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setViewDialogOpen(true);
  };
  
  // Get filtered media items
  const getFilteredMedia = () => {
    let filtered = mediaItems;
    
    if (activeTab > 0) {
      const tabCategory = tabs[activeTab].value;
      filtered = filtered.filter(item => item.category === tabCategory);
    }
    
    return filtered;
  };
  
  // Get media type icon
  const getMediaTypeIcon = (mediaType) => {
    const type = mediaTypes.find(t => t.value === mediaType);
    return type ? type.icon : <PhotoIcon />;
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Media Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Upload Media
        </Button>
      </Box>
      
      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Items
                </Typography>
                <Typography variant="h4">
                  {stats.total_items}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Size
                </Typography>
                <Typography variant="h4">
                  {stats.total_size_mb} MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Logos
                </Typography>
                <Typography variant="h4">
                  {stats.category_counts?.logos || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Templates
                </Typography>
                <Typography variant="h4">
                  {stats.category_counts?.templates || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Media Type</InputLabel>
              <Select
                value={filterMediaType}
                onChange={(e) => setFilterMediaType(e.target.value)}
                label="Media Type"
              >
                <MenuItem value="">All Types</MenuItem>
                {mediaTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterMediaType('');
                setActiveTab(0);
              }}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {tabs.map((tab, index) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>
      
      {/* Media Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ImageList cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={16}>
          {getFilteredMedia().map((item) => (
            <ImageListItem key={item.id}>
              <img
                src={item.file_url}
                alt={item.title}
                loading="lazy"
                style={{ height: 200, objectFit: 'cover' }}
              />
              <ImageListItemBar
                title={item.title}
                subtitle={
                  <Box>
                    <Chip
                      label={item.media_type.replace('_', ' ')}
                      size="small"
                      color="primary"
                      sx={{ mb: 0.5 }}
                    />
                    <Typography variant="caption" display="block">
                      {item.file_size_mb} MB • {item.width}x{item.height}
                    </Typography>
                  </Box>
                }
                actionIcon={
                  <Box>
                    <Tooltip title="View">
                      <IconButton
                        onClick={() => handleView(item)}
                        sx={{ color: 'white' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() => handleEdit(item)}
                        sx={{ color: 'white' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDelete(item.id)}
                        sx={{ color: 'white' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Media</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                  disabled={uploading}
                >
                  {uploadFile ? uploadFile.name : 'Select File'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Media Type</InputLabel>
                  <Select
                    value={uploadMediaType}
                    onChange={(e) => setUploadMediaType(e.target.value)}
                    label="Media Type"
                  >
                    {mediaTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {type.icon}
                          <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter a title for this media"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Optional description"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || !uploadMediaType || uploading}
          >
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Media Details</DialogTitle>
        <DialogContent>
          {selectedMedia && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedMedia.file_url}
                    alt={selectedMedia.title}
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    {selectedMedia.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedMedia.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    File Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedMedia.media_type.replace('_', ' ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Size:</strong> {selectedMedia.file_size_mb} MB
                  </Typography>
                  <Typography variant="body2">
                    <strong>Dimensions:</strong> {selectedMedia.width}x{selectedMedia.height}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Uploaded:</strong> {new Date(selectedMedia.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mt: 2 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default MediaManager;