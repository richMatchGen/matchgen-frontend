import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/config';

const UploadGraphicPack = () => {
  const { auth, user } = useAuth();
  const token = auth.token;
  const [graphicPacks, setGraphicPacks] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packCategory, setPackCategory] = useState('');
  const [packPrice, setPackPrice] = useState(0);
  const [packActive, setPackActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const categories = [
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'rugby', label: 'Rugby' },
    { value: 'cricket', label: 'Cricket' },
    { value: 'hockey', label: 'Hockey' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'general', label: 'General Sports' }
  ];

  useEffect(() => {
    if (!token) {
      return;
    }
    fetchGraphicPacks();
  }, [token]);

  const fetchGraphicPacks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('graphicpack/packs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle both paginated and direct array responses
      const packs = response.data.results || response.data || [];
      setGraphicPacks(packs);
    } catch (err) {
      setError('Failed to fetch graphic packs');
      console.error('Error fetching graphic packs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !packName.trim()) {
      setError('Please select a file and enter a pack name');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', packName);
      formData.append('description', packDescription);
      formData.append('category', packCategory);
      formData.append('price', packPrice);
      formData.append('is_active', packActive);

      const response = await apiClient.post('graphicpack/packs/create/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Graphic pack uploaded successfully!');
      setPackName('');
      setPackDescription('');
      setPackCategory('');
      setPackPrice(0);
      setPackActive(true);
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      fetchGraphicPacks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload graphic pack');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (packId) => {
    if (window.confirm('Are you sure you want to delete this graphic pack?')) {
      try {
        await apiClient.delete(`graphicpack/packs/${packId}/delete/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Graphic pack deleted successfully');
        fetchGraphicPacks();
      } catch (err) {
        setError('Failed to delete graphic pack');
        console.error('Delete error:', err);
      }
    }
  };

  const handleViewPack = async (packId) => {
    try {
      const response = await apiClient.get(`graphicpack/packs/${packId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPack(response.data);
      setViewDialogOpen(true);
    } catch (err) {
      setError('Failed to fetch pack details');
      console.error('View error:', err);
    }
  };

  const handleEditPack = async (packId) => {
    try {
      const response = await apiClient.get(`graphicpack/packs/${packId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPack(response.data);
      setEditDialogOpen(true);
    } catch (err) {
      setError('Failed to fetch pack details');
      console.error('Edit error:', err);
    }
  };

  const handleUpdatePack = async () => {
    try {
      setUploading(true);
      const updateData = {
        name: selectedPack.name,
        description: selectedPack.description,
        category: selectedPack.category,
        price: selectedPack.price,
        is_active: selectedPack.is_active
      };

      await apiClient.put(`graphicpack/packs/${selectedPack.id}/update/`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Graphic pack updated successfully');
      setEditDialogOpen(false);
      setSelectedPack(null);
      fetchGraphicPacks();
    } catch (err) {
      setError('Failed to update graphic pack');
      console.error('Update error:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    const timer = setTimeout(clearMessages, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  if (!token) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Please log in to access the Upload Graphic Pack</Typography>
      </Box>
    );
  }

  if (!user?.is_staff) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>You need admin privileges to access this page.</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Upload Graphic Pack
      </Typography>

      {/* Upload Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload New Graphic Pack
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a new graphic pack with templates and assets for social media posts.
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <input
                id="file-input"
                type="file"
                accept=".zip,.rar,.7z"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  disabled={uploading}
                >
                  Select Pack File
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pack Name"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="Enter pack name"
                disabled={uploading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                value={packDescription}
                onChange={(e) => setPackDescription(e.target.value)}
                placeholder="Enter pack description"
                disabled={uploading}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={packCategory}
                  onChange={(e) => setPackCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={packPrice}
                onChange={(e) => setPackPrice(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                disabled={uploading}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={packActive}
                    onChange={(e) => setPackActive(e.target.checked)}
                    disabled={uploading}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || !packName.trim() || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
                fullWidth
              >
                {uploading ? 'Uploading...' : 'Upload Pack'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Graphic Packs List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Graphic Packs
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchGraphicPacks}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : graphicPacks.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No graphic packs found. Upload your first pack to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {graphicPacks.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {pack.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pack.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={pack.category} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${pack.price?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={pack.is_active ? 'Active' : 'Inactive'} 
                          size="small" 
                          color={pack.is_active ? 'success' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>{formatDate(pack.created_at)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewPack(pack.id)}
                          color="primary"
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditPack(pack.id)}
                          color="secondary"
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(pack.id)}
                          color="error"
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Pack Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            {selectedPack?.name} - Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPack && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPack.name}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPack.category}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ${selectedPack.price?.toFixed(2) || '0.00'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <Chip 
                      label={selectedPack.is_active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={selectedPack.is_active ? 'success' : 'default'} 
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedPack.description || 'No description provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedPack.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedPack.updated_at)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Pack Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">
            Edit Graphic Pack
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedPack && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pack Name"
                    value={selectedPack.name}
                    onChange={(e) => setSelectedPack({...selectedPack, name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={selectedPack.description}
                    onChange={(e) => setSelectedPack({...selectedPack, description: e.target.value})}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedPack.category}
                      onChange={(e) => setSelectedPack({...selectedPack, category: e.target.value})}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          {category.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={selectedPack.price}
                    onChange={(e) => setSelectedPack({...selectedPack, price: parseFloat(e.target.value) || 0})}
                    inputProps={{ step: 0.01, min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={selectedPack.is_active}
                        onChange={(e) => setSelectedPack({...selectedPack, is_active: e.target.checked})}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdatePack}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadGraphicPack;
