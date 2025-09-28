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
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/config';
import FeatureRestrictedButton from '../components/FeatureRestrictedButton';
import FeatureRestrictedElement from '../components/FeatureRestrictedElement';

const PSDProcessor = () => {
  const { auth, logout } = useAuth();
  const token = auth.token;
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // New state for enhanced PSD processing
  const [graphicPacks, setGraphicPacks] = useState([]);
  const [selectedGraphicPack, setSelectedGraphicPack] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [selectedLayers, setSelectedLayers] = useState([]);
  const [layerDialogOpen, setLayerDialogOpen] = useState(false);
  const [processingLayers, setProcessingLayers] = useState(false);

  // Predefined layer names and content types
  const predefinedLayers = [
    'away_score_ft', 'home_score_ft', 'away_score_ht', 'home_score_ht',
    'club_logo', 'opponent_logo', 'substitutes', 'starting_lineup',
    'player_on', 'player_off', 'date', 'time'
  ];

  const contentTypes = [
    { value: 'fulltime', label: 'Full Time' },
    { value: 'halftime', label: 'Half Time' },
    { value: 'matchday', label: 'Match Day' },
    { value: 'sub', label: 'Substitution' },
    { value: 'goal', label: 'Goal' },
    { value: 'upcomingfixture', label: 'Upcoming Fixture' },
    { value: 'startingXI', label: 'Starting XI' }
  ];

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await apiClient.get('users/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        fetchDocuments();
        fetchGraphicPacks();
      } catch (err) {
        console.error('Failed to fetch user:', err);
        logout();
      }
    };

    fetchUser();
  }, [token]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('psd/documents/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGraphicPacks = async () => {
    try {
      const response = await apiClient.get('graphicpack/packs/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const packs = response.data?.results || response.data || [];
      setGraphicPacks(Array.isArray(packs) ? packs : []);
    } catch (err) {
      console.error('Error fetching graphic packs:', err);
      setGraphicPacks([]);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.psd')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid PSD file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);

      const response = await apiClient.post('psd/upload/', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('PSD file uploaded and processed successfully!');
      setTitle('');
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload PSD file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await apiClient.delete(`psd/documents/${documentId}/delete/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Document deleted successfully');
        fetchDocuments();
      } catch (err) {
        setError('Failed to delete document');
        console.error('Delete error:', err);
      }
    }
  };

  const handleViewDocument = async (documentId) => {
    try {
      const response = await apiClient.get(`psd/documents/${documentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedDocument(response.data);
      setViewDialogOpen(true);
    } catch (err) {
      setError('Failed to fetch document details');
      console.error('View error:', err);
    }
  };

  const handleLayerSelection = (documentId) => {
    setSelectedDocument(documents.find(doc => doc.id === documentId));
    setLayerDialogOpen(true);
  };

  const handleLayerToggle = (layerName) => {
    setSelectedLayers(prev => 
      prev.includes(layerName) 
        ? prev.filter(name => name !== layerName)
        : [...prev, layerName]
    );
  };

  const handleProcessLayers = async () => {
    if (!selectedGraphicPack || !selectedContentType || selectedLayers.length === 0) {
      setError('Please select a graphic pack, content type, and at least one layer');
      return;
    }

    try {
      setProcessingLayers(true);
      setError('');

      const response = await apiClient.post('psd/process-layers/', {
        document_id: selectedDocument.id,
        graphic_pack_id: selectedGraphicPack,
        content_type: selectedContentType,
        layer_names: selectedLayers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Layers processed and saved to graphic pack successfully!');
      setLayerDialogOpen(false);
      setSelectedLayers([]);
      setSelectedGraphicPack('');
      setSelectedContentType('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process layers');
      console.error('Layer processing error:', err);
    } finally {
      setProcessingLayers(false);
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
        <Typography variant="h6">Please log in to access the PSD Processor</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        PSD Layer Extractor
      </Typography>

      {/* Upload Section */}
      {/* <FeatureRestrictedElement
        featureCode="psd_processor"
        tooltipText="PSD processing requires SemiPro Gen or higher"
        upgradeDialogTitle="PSD Processing Feature"
        upgradeDialogDescription="Upload and process PSD files to extract design elements for your social media posts."
      > */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Upload PSD File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Supported PSD versions: 1-7 (Photoshop CS6 and earlier). 
              PSD version 8 (Photoshop CC 2018+) is not yet supported.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <input
                  id="file-input"
                  type="file"
                  accept=".psd"
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
                    Select PSD File
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Document Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                  disabled={uploading}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Graphic Pack</InputLabel>
                  <Select
                    value={selectedGraphicPack}
                    onChange={(e) => setSelectedGraphicPack(e.target.value)}
                    label="Graphic Pack"
                    disabled={uploading}
                  >
                    {graphicPacks && graphicPacks.length > 0 && graphicPacks.map((pack) => (
                      <MenuItem key={pack.id} value={pack.id}>
                        {pack.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={selectedContentType}
                    onChange={(e) => setSelectedContentType(e.target.value)}
                    label="Content Type"
                    disabled={uploading}
                  >
                    {contentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Button
                featureCode="psd_processor"
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || !selectedGraphicPack || !selectedContentType || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : null}
                tooltipText="PSD processing requires SemiPro Gen or higher"
                upgradeDialogTitle="PSD Processing Feature"
                upgradeDialogDescription="Upload and process PSD files to extract design elements for your social media posts."
              >
                {uploading ? 'Processing...' : 'Upload & Process'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      {/* </FeatureRestrictedElement> */}

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

      {/* Documents List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Your PSD Documents
            </Typography>
            <Button
              variant="outlined"
              onClick={fetchDocuments}
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
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No PSD documents found. Upload your first PSD file to get started.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Dimensions</TableCell>
                    <TableCell>Layers</TableCell>
                    <TableCell>Uploaded</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {doc.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${doc.width} × ${doc.height}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${doc.layers?.length || 0} layers`} 
                          size="small" 
                          color="primary" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(doc.uploaded_at)}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleViewDocument(doc.id)}
                          color="primary"
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleLayerSelection(doc.id)}
                          color="secondary"
                          title="Process Layers"
                        >
                          <UploadIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(doc.id)}
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

      {/* Layer Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="h6" sx={{ color: 'white' }}>
              {selectedDocument?.title} - Layer Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          {selectedDocument && (
            <Box>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Document: {selectedDocument.width} × {selectedDocument.height} pixels
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Total Layers: {selectedDocument.layers?.length || 0}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" sx={{ color: 'white' }} gutterBottom>
                Layer Information
              </Typography>
              
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 2,
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  '& .MuiAlert-message': {
                    color: 'white'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: 'white' }}>
                  <strong style={{ color: 'white' }}>Center Point Analysis:</strong> Each layer now includes center coordinates for precise positioning, 
                  alignment, and design automation. Use center points for rotation anchors, scaling operations, and layout calculations.
                </Typography>
              </Alert>
              
              <TableContainer 
                component={Paper} 
                variant="outlined"
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Layer Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Position (X, Y)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Center Point</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Size (W × H)</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Bounding Box</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Visible</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Opacity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDocument.layers?.map((layer, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium" sx={{ color: 'white' }}>
                            {layer.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${layer.x}, ${layer.y}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${layer.center_x?.toFixed(1) || '0.0'}, ${layer.center_y?.toFixed(1) || '0.0'}`} 
                            size="small" 
                            color="primary" 
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${layer.width} × ${layer.height}`} 
                            size="small" 
                            color="secondary" 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" sx={{ color: 'white' }}>
                            {layer.bounding_box}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={layer.visible ? 'Yes' : 'No'} 
                            size="small" 
                            color={layer.visible ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {Math.round(layer.opacity)}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Layer Processing Dialog */}
      <Dialog
        open={layerDialogOpen}
        onClose={() => setLayerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: 'white' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            Process Layers - {selectedDocument?.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
              Select which layers to process and save to the graphic pack:
            </Typography>
            
            <FormGroup>
              {predefinedLayers.map((layerName) => (
                <FormControlLabel
                  key={layerName}
                  control={
                    <Checkbox
                      checked={selectedLayers.includes(layerName)}
                      onChange={() => handleLayerToggle(layerName)}
                      sx={{ color: 'white' }}
                    />
                  }
                  label={
                    <Typography sx={{ color: 'white' }}>
                      {layerName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLayerDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProcessLayers}
            variant="contained"
            disabled={selectedLayers.length === 0 || processingLayers}
            startIcon={processingLayers ? <CircularProgress size={20} /> : null}
          >
            {processingLayers ? 'Processing...' : 'Process Selected Layers'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PSDProcessor;
