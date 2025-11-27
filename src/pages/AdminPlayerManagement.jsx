import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
  Alert,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Upload as UploadIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import apiClient from '../api/config';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';

const AdminPlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedImageType, setSelectedImageType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/admin/player-tasks/');
      setPlayers(response.data.players || []);
    } catch (err) {
      console.error('Error fetching players:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load players',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleUploadClick = (player, imageType) => {
    setSelectedPlayer(player);
    setSelectedImageType(imageType);
    const currentUrl = player[`${imageType}_url`] || '';
    setImageUrl(currentUrl);
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImageUrl(''); // Clear URL when file is selected
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    document.getElementById('file-input').value = '';
  };

  const handleUploadSubmit = async () => {
    if (!imageUrl.trim() && !selectedFile) {
      setSnackbar({
        open: true,
        message: 'Please provide either an image file or URL',
        severity: 'error'
      });
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('player_id', selectedPlayer.id);
      formData.append('image_type', selectedImageType);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (imageUrl.trim()) {
        formData.append('image_url', imageUrl.trim());
      }

      await apiClient.post('/users/admin/upload-player-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const imageTypeLabel = selectedImageType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      setSnackbar({
        open: true,
        message: `${imageTypeLabel} image uploaded successfully`,
        severity: 'success'
      });
      
      setUploadDialogOpen(false);
      setImageUrl('');
      setSelectedFile(null);
      fetchPlayers(); // Refresh the player list
    } catch (err) {
      console.error('Error uploading image:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to upload image',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const getImageStatus = (player, imageType) => {
    const url = player[`${imageType}_url`];
    return url ? 'completed' : 'pending';
  };

  const getImageTypeLabel = (imageType) => {
    const labels = {
      'cutout': 'Cutout',
      'highlight_home': 'Highlight - Home',
      'highlight_away': 'Highlight - Away',
      'potm': 'POTM'
    };
    return labels[imageType] || imageType;
  };

  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <CircularProgress size={60} />
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" gutterBottom>
                      Players - Premium Bespoke Clubs
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={fetchPlayers}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                    >
                      Refresh
                    </Button>
                  </Box>
                  
                  {players.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No players found for Premium Bespoke clubs.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Club</TableCell>
                            <TableCell>Player</TableCell>
                            <TableCell>Squad #</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Cutout</TableCell>
                            <TableCell>Highlight - Home</TableCell>
                            <TableCell>Highlight - Away</TableCell>
                            <TableCell>POTM</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {players.map((player) => (
                            <TableRow key={player.id}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {player.club_logo && (
                                    <Avatar
                                      src={player.club_logo}
                                      sx={{ width: 32, height: 32 }}
                                    />
                                  )}
                                  <Typography variant="body2">
                                    {player.club_name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {player.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={player.squad_no} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {player.position}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getImageStatus(player, 'cutout') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getImageStatus(player, 'cutout') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(player, 'cutout')}
                                  >
                                    {getImageStatus(player, 'cutout') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getImageStatus(player, 'highlight_home') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getImageStatus(player, 'highlight_home') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(player, 'highlight_home')}
                                  >
                                    {getImageStatus(player, 'highlight_home') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getImageStatus(player, 'highlight_away') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getImageStatus(player, 'highlight_away') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(player, 'highlight_away')}
                                  >
                                    {getImageStatus(player, 'highlight_away') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getImageStatus(player, 'potm') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getImageStatus(player, 'potm') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(player, 'potm')}
                                  >
                                    {getImageStatus(player, 'potm') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Upload Dialog */}
          <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              Upload {getImageTypeLabel(selectedImageType)} Image
            </DialogTitle>
            <DialogContent>
              {selectedPlayer && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Club: {selectedPlayer.club_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Player: {selectedPlayer.name} (#{selectedPlayer.squad_no})
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Select Image File'}
                  </Button>
                </label>
                {selectedFile && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleRemoveFile}
                    startIcon={<DeleteIcon />}
                    sx={{ width: '100%' }}
                  >
                    Remove File
                  </Button>
                )}
              </Box>

              <TextField
                fullWidth
                label="Image URL"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) {
                    setSelectedFile(null);
                    document.getElementById('file-input').value = '';
                  }
                }}
                placeholder="https://example.com/image.jpg"
                margin="normal"
                disabled={!!selectedFile || uploading}
                helperText={selectedFile ? "File selected - URL field disabled" : "Or paste an image URL"}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                variant="contained"
                disabled={uploading || (!imageUrl.trim() && !selectedFile)}
                startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default AdminPlayerManagement;

