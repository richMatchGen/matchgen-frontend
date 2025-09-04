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
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/config';

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
      } catch (err) {
        console.error('Failed to fetch user:', err);
        logout();
      }
    };

    fetchUser();
  }, [token, logout]);

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
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upload PSD File
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={4}>
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
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || !title.trim() || uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {uploading ? 'Processing...' : 'Upload'}
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            {selectedDocument?.title} - Layer Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <Box>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Document: {selectedDocument.width} × {selectedDocument.height} pixels
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Layers: {selectedDocument.layers?.length || 0}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Layer Information
              </Typography>
              
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Layer Name</TableCell>
                      <TableCell>Position (X, Y)</TableCell>
                      <TableCell>Size (W × H)</TableCell>
                      <TableCell>Bounding Box</TableCell>
                      <TableCell>Visible</TableCell>
                      <TableCell>Opacity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDocument.layers?.map((layer, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
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
                            label={`${layer.width} × ${layer.height}`} 
                            size="small" 
                            color="secondary" 
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
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
                          <Typography variant="body2">
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
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PSDProcessor;
