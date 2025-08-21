import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const TextElementManagement = () => {
  const [textElements, setTextElements] = useState([]);
  const [graphicPacks, setGraphicPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Form state
  const [formData, setFormData] = useState({
    graphic_pack: '',
    content_type: '',
    element_name: '',
    position_x: 400,
    position_y: 150,
    font_size: 24,
    font_family: 'Arial',
    font_color: '#FFFFFF',
    alignment: 'center',
    font_weight: 'normal'
  });

  // Content type options
  const contentTypes = [
    { value: 'matchday', label: 'Matchday' },
    { value: 'upcoming', label: 'Upcoming Fixture' },
    { value: 'startingxi', label: 'Starting XI' },
    { value: 'substitution', label: 'Substitution' },
    { value: 'result', label: 'Match Result' }
  ];

  // Element name options
  const elementNames = [
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'venue', label: 'Venue' },
    { value: 'opponent', label: 'Opponent' },
    { value: 'home_away', label: 'Home/Away' },
    { value: 'score', label: 'Score' },
    { value: 'team_name', label: 'Team Name' },
    { value: 'competition', label: 'Competition' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
             // Fetch text elements
       const elementsResponse = await axios.get(
         'https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/',
         { headers: { Authorization: `Bearer ${token}` } }
       );
       setTextElements(elementsResponse.data || []);

       // Fetch graphic packs
       const packsResponse = await axios.get(
         'https://matchgen-backend-production.up.railway.app/api/graphicpack/packs/',
         { headers: { Authorization: `Bearer ${token}` } }
       );
       setGraphicPacks(packsResponse.data || []);
         } catch (error) {
       console.error('Error fetching data:', error);
       let errorMessage = 'Failed to fetch data';
       
       if (error.response?.status === 404) {
         errorMessage = 'API endpoints not found. Please check if the backend is deployed correctly.';
       } else if (error.response?.status === 401) {
         errorMessage = 'Authentication required. Please log in again.';
       } else if (error.response?.data?.error) {
         errorMessage = error.response.data.error;
       }
       
       setSnackbar({
         open: true,
         message: errorMessage,
         severity: 'error'
       });
       
       // Set empty arrays to prevent mapping errors
       setTextElements([]);
       setGraphicPacks([]);
     } finally {
       setLoading(false);
     }
  };

  const handleOpenDialog = (element = null) => {
    if (element) {
      setEditingElement(element);
      setFormData({
        graphic_pack: element.graphic_pack,
        content_type: element.content_type,
        element_name: element.element_name,
        position_x: element.position_x,
        position_y: element.position_y,
        font_size: element.font_size,
        font_family: element.font_family,
        font_color: element.font_color,
        alignment: element.alignment,
        font_weight: element.font_weight
      });
    } else {
      setEditingElement(null);
      setFormData({
        graphic_pack: '',
        content_type: '',
        element_name: '',
        position_x: 400,
        position_y: 150,
        font_size: 24,
        font_family: 'Arial',
        font_color: '#FFFFFF',
        alignment: 'center',
        font_weight: 'normal'
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingElement(null);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (editingElement) {
        // Update existing element
        await axios.put(
          `https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/${editingElement.id}/update/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({
          open: true,
          message: 'Text element updated successfully',
          severity: 'success'
        });
      } else {
        // Create new element
        await axios.post(
          'https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/create/',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({
          open: true,
          message: 'Text element created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error saving text element:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save text element',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (elementId) => {
    if (!window.confirm('Are you sure you want to delete this text element?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/${elementId}/delete/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: 'Text element deleted successfully',
        severity: 'success'
      });
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting text element:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete text element',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Text Element Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Text Element
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Graphic Pack</TableCell>
                <TableCell>Content Type</TableCell>
                <TableCell>Element Name</TableCell>
                <TableCell>Position (X, Y)</TableCell>
                <TableCell>Font Size</TableCell>
                <TableCell>Font Family</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Alignment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
                                      <TableBody>
               {Array.isArray(textElements) && textElements.length > 0 ? (
                 textElements.map((element) => (
                   <TableRow key={element.id} hover>
                     <TableCell>{element.graphic_pack_name}</TableCell>
                     <TableCell>
                       <Chip 
                         label={element.content_type} 
                         size="small" 
                         color="primary" 
                         variant="outlined"
                       />
                     </TableCell>
                     <TableCell>
                       <Chip 
                         label={element.element_name} 
                         size="small" 
                         color="secondary" 
                         variant="outlined"
                       />
                     </TableCell>
                     <TableCell>
                       ({element.position_x}, {element.position_y})
                     </TableCell>
                     <TableCell>{element.font_size}px</TableCell>
                     <TableCell>{element.font_family}</TableCell>
                     <TableCell>
                       <Box
                         sx={{
                           width: 20,
                           height: 20,
                           backgroundColor: element.font_color,
                           border: '1px solid #ccc',
                           borderRadius: 1
                         }}
                       />
                     </TableCell>
                     <TableCell>
                       <Chip 
                         label={element.alignment} 
                         size="small" 
                         variant="outlined"
                       />
                     </TableCell>
                     <TableCell>
                       <IconButton
                         size="small"
                         onClick={() => handleOpenDialog(element)}
                         color="primary"
                       >
                         <EditIcon />
                       </IconButton>
                       <IconButton
                         size="small"
                         onClick={() => handleDelete(element.id)}
                         color="error"
                       >
                         <DeleteIcon />
                       </IconButton>
                     </TableCell>
                   </TableRow>
                 ))
               ) : (
                 <TableRow>
                   <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                     <Typography variant="body1" color="text.secondary">
                       No text elements found. Click "Add Text Element" to create your first one.
                     </Typography>
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingElement ? 'Edit Text Element' : 'Add Text Element'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Graphic Pack</InputLabel>
              <Select
                value={formData.graphic_pack}
                onChange={(e) => setFormData({ ...formData, graphic_pack: e.target.value })}
                label="Graphic Pack"
              >
                                 {Array.isArray(graphicPacks) && graphicPacks.map((pack) => (
                  <MenuItem key={pack.id} value={pack.id}>
                    {pack.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                label="Content Type"
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Element Name</InputLabel>
              <Select
                value={formData.element_name}
                onChange={(e) => setFormData({ ...formData, element_name: e.target.value })}
                label="Element Name"
              >
                {elementNames.map((name) => (
                  <MenuItem key={name.value} value={name.value}>
                    {name.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Font Family"
              value={formData.font_family}
              onChange={(e) => setFormData({ ...formData, font_family: e.target.value })}
              fullWidth
            />

            <TextField
              label="Position X"
              type="number"
              value={formData.position_x}
              onChange={(e) => setFormData({ ...formData, position_x: parseInt(e.target.value) || 0 })}
              fullWidth
            />

            <TextField
              label="Position Y"
              type="number"
              value={formData.position_y}
              onChange={(e) => setFormData({ ...formData, position_y: parseInt(e.target.value) || 0 })}
              fullWidth
            />

            <TextField
              label="Font Size"
              type="number"
              value={formData.font_size}
              onChange={(e) => setFormData({ ...formData, font_size: parseInt(e.target.value) || 12 })}
              fullWidth
            />

            <TextField
              label="Font Color"
              type="color"
              value={formData.font_color}
              onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Alignment</InputLabel>
              <Select
                value={formData.alignment}
                onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                label="Alignment"
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Font Weight</InputLabel>
              <Select
                value={formData.font_weight}
                onChange={(e) => setFormData({ ...formData, font_weight: e.target.value })}
                label="Font Weight"
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.graphic_pack || !formData.content_type || !formData.element_name}
          >
            {editingElement ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default TextElementManagement;
