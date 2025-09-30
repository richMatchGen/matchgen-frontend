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
  CircularProgress,
  Pagination,
  Grid,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';

const TextElementManagement = () => {
  const [textElements, setTextElements] = useState([]);
  const [graphicPacks, setGraphicPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20
  });

  // Filter state
  const [filters, setFilters] = useState({
    content_type: '',
    graphic_pack: '',
    element_name: '',
    search: ''
  });

  // Form state
  const [formData, setFormData] = useState({
    graphic_pack: '',
    content_type: '',
    element_name: '',
    element_type: 'text', // New field for element type
    position_x: 400,
    position_y: 150,
    // Home/Away positioning fields
    home_position_x: 400,
    home_position_y: 150,
    away_position_x: 400,
    away_position_y: 150,
    font_size: 24,
    font_family: 'Arial',
    font_color: '#FFFFFF',
    alignment: 'center',
    text_alignment: 'center',
    font_weight: 'normal',
    // Image-specific fields
    image_width: 100,
    image_height: 100,
    maintain_aspect_ratio: true
  });

  // Content type options
  const contentTypes = [
    { value: 'matchday', label: 'Matchday' },
    { value: 'upcomingFixture', label: 'Upcoming Fixture' },
    { value: 'startingXI', label: 'Starting XI' },
    { value: 'sub', label: 'Substitution' },
    { value: 'goal', label: 'Goal' },
    { value: 'halftime', label: 'Half Time' },
    { value: 'fulltime', label: 'Full Time' },
    { value: 'player', label: 'Player of the Match' }
  ];

  // Element name options
  const elementNames = [
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'venue', label: 'Venue' },
    { value: 'opponent', label: 'Opponent' },
    { value: 'opponent_logo', label: 'Opponent Logo' }, // Image element
    { value: 'club_logo', label: 'Club Logo' }, // New club logo element
    { value: 'home_away', label: 'Home/Away' },
    { value: 'score', label: 'Score' },
    { value: 'team_name', label: 'Team Name' },
    { value: 'competition', label: 'Competition' },
    { value: 'player_on', label: 'Player On' },
    { value: 'player_off', label: 'Player Off' },
    { value: 'minute', label: 'Minute' },
    { value: 'home_score_ht', label: 'Home Score (Half Time)' },
    { value: 'away_score_ht', label: 'Away Score (Half Time)' },
    { value: 'home_score_ft', label: 'Home Score (Full Time)' },
    { value: 'away_score_ft', label: 'Away Score (Full Time)' },
    { value: 'starting_lineup', label: 'Starting Lineup' },
    { value: 'substitutes', label: 'Substitutes' }
  ];

     // Fetch data on component mount
   useEffect(() => {
     fetchData();
   }, []);

   // Handle filter changes
   const handleFilterChange = (filterType, value) => {
     const newFilters = { ...filters, [filterType]: value };
     setFilters(newFilters);
     fetchData(1, newFilters); // Reset to page 1 when filters change
   };

   // Handle pagination
   const handlePageChange = (event, page) => {
     fetchData(page, filters);
   };

   // Clear all filters
   const clearFilters = () => {
     const clearedFilters = {
       content_type: '',
       graphic_pack: '',
       element_name: '',
       search: ''
     };
     setFilters(clearedFilters);
     fetchData(1, clearedFilters);
   };

   // Debug effect to log when graphicPacks changes
   useEffect(() => {
     console.log('graphicPacks state changed:', graphicPacks);
   }, [graphicPacks]);

  const fetchData = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page);
      
      // Add filters to query parameters
      if (currentFilters.content_type) {
        params.append('content_type', currentFilters.content_type);
      }
      if (currentFilters.graphic_pack) {
        params.append('graphic_pack', currentFilters.graphic_pack);
      }
      if (currentFilters.element_name) {
        params.append('element_name', currentFilters.element_name);
      }
      if (currentFilters.search) {
        params.append('search', currentFilters.search);
      }
      
      // Fetch text elements with pagination and filters
      console.log('Fetching text elements with params:', params.toString());
      const elementsResponse = await axios.get(
        `https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Text elements response:', elementsResponse.data);
      
      // Handle paginated response
      let textElementsData = [];
      let paginationData = {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 20
      };
      
      if (elementsResponse.data && elementsResponse.data.results) {
        // Paginated response - extract results and pagination info
        textElementsData = elementsResponse.data.results;
        paginationData = {
          currentPage: elementsResponse.data.current_page || 1,
          totalPages: elementsResponse.data.total_pages || 1,
          totalCount: elementsResponse.data.count || 0,
          pageSize: elementsResponse.data.page_size || 20
        };
        console.log('Extracted text elements from paginated response:', textElementsData);
        console.log('Pagination data:', paginationData);
      } else if (Array.isArray(elementsResponse.data)) {
        // Direct array response (fallback)
        textElementsData = elementsResponse.data;
        console.log('Direct text elements array response:', textElementsData);
      } else {
        console.error('Unexpected text elements response format:', elementsResponse.data);
        textElementsData = [];
      }
      
      console.log('Final text elements data:', textElementsData);
      setTextElements(textElementsData);
      setPagination(paginationData);

       // Fetch graphic packs
       console.log('Fetching graphic packs...');
       const packsResponse = await axios.get(
         'https://matchgen-backend-production.up.railway.app/api/graphicpack/packs/',
         { headers: { Authorization: `Bearer ${token}` } }
       );
       console.log('Graphic packs response:', packsResponse.data);
       console.log('Graphic packs type:', typeof packsResponse.data);
       
       // Handle paginated response
       let graphicPacksData = [];
       if (packsResponse.data && packsResponse.data.results) {
         // Paginated response - extract results
         graphicPacksData = packsResponse.data.results;
         console.log('Extracted results from paginated response:', graphicPacksData);
       } else if (Array.isArray(packsResponse.data)) {
         // Direct array response
         graphicPacksData = packsResponse.data;
         console.log('Direct array response:', graphicPacksData);
       } else {
         console.error('Unexpected response format:', packsResponse.data);
         graphicPacksData = [];
       }
       
       console.log('Final graphic packs data:', graphicPacksData);
       setGraphicPacks(graphicPacksData);
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
        element_type: element.element_type || 'text',
        position_x: element.position_x,
        position_y: element.position_y,
        home_position_x: element.home_position_x || element.position_x,
        home_position_y: element.home_position_y || element.position_y,
        away_position_x: element.away_position_x || element.position_x,
        away_position_y: element.away_position_y || element.position_y,
        font_size: element.font_size,
        font_family: element.font_family,
        font_color: element.font_color,
        alignment: element.alignment,
        text_alignment: element.text_alignment || 'center',
        font_weight: element.font_weight,
        image_width: element.image_width || 100,
        image_height: element.image_height || 100,
        maintain_aspect_ratio: element.maintain_aspect_ratio !== undefined ? element.maintain_aspect_ratio : true
      });
    } else {
      setEditingElement(null);
      setFormData({
        graphic_pack: '',
        content_type: '',
        element_name: '',
        element_type: 'text',
        position_x: 400,
        position_y: 150,
        home_position_x: 400,
        home_position_y: 150,
        away_position_x: 400,
        away_position_y: 150,
        font_size: 24,
        font_family: 'Arial',
        font_color: '#FFFFFF',
        alignment: 'center',
        text_alignment: 'center',
        font_weight: 'normal',
        image_width: 100,
        image_height: 100,
        maintain_aspect_ratio: true
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
        console.log('Updating text element with data:', formData);
        const response = await axios.put(
          `https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/${editingElement.id}/update/`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Update response:', response.data);
        setSnackbar({
          open: true,
          message: 'Text element updated successfully',
          severity: 'success'
        });
      } else {
        // Create new element
        console.log('Creating text element with data:', formData);
        const response = await axios.post(
          'https://matchgen-backend-production.up.railway.app/api/graphicpack/text-elements/create/',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Create response:', response.data);
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
      console.error('Error response data:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.response?.data || 'Failed to save text element',
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

     const createTestData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/create-test-data/',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: 'Test data created successfully',
        severity: 'success'
      });
      
      // Refresh data after creating test data
      fetchData();
    } catch (error) {
      console.error('Error creating test data:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to create test data',
        severity: 'error'
      });
    }
  };

  const createClubLogoElement = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        'https://matchgen-backend-production.up.railway.app/api/graphicpack/add-club-logo-element/',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbar({
        open: true,
        message: response.data.message || 'Club logo element created successfully',
        severity: 'success'
      });
      
      // Refresh data after creating club logo element
      fetchData();
    } catch (error) {
      console.error('Error creating club logo element:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to create club logo element',
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
                   <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={fetchData}
            >
              Refresh Data
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={createTestData}
            >
              Create Test Data
            </Button>
            <Button
              variant="outlined"
              color="info"
              onClick={createClubLogoElement}
            >
              Add Club Logo
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Element
            </Button>
          </Box>
       </Box>
       
       {/* Debug info */}
       <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
         <Typography variant="body2" color="text.secondary">
           Debug: Graphic Packs loaded: {graphicPacks.length} | Text Elements loaded: {textElements.length}
         </Typography>
       </Box>

       {/* Filters */}
       <Card sx={{ mb: 3 }}>
         <CardContent>
           <Typography variant="h6" gutterBottom>
             <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
             Filters
           </Typography>
           <Grid container spacing={2} alignItems="center">
             <Grid item xs={12} sm={6} md={3}>
               <TextField
                 label="Search"
                 value={filters.search}
                 onChange={(e) => handleFilterChange('search', e.target.value)}
                 fullWidth
                 size="small"
                 InputProps={{
                   startAdornment: (
                     <InputAdornment position="start">
                       <SearchIcon />
                     </InputAdornment>
                   ),
                 }}
               />
             </Grid>
             <Grid item xs={12} sm={6} md={3}>
               <FormControl fullWidth size="small">
                 <InputLabel>Content Type</InputLabel>
                 <Select
                   value={filters.content_type}
                   onChange={(e) => handleFilterChange('content_type', e.target.value)}
                   label="Content Type"
                 >
                   <MenuItem value="">All Content Types</MenuItem>
                   {contentTypes.map((type) => (
                     <MenuItem key={type.value} value={type.value}>
                       {type.label}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} sm={6} md={3}>
               <FormControl fullWidth size="small">
                 <InputLabel>Graphic Pack</InputLabel>
                 <Select
                   value={filters.graphic_pack}
                   onChange={(e) => handleFilterChange('graphic_pack', e.target.value)}
                   label="Graphic Pack"
                 >
                   <MenuItem value="">All Graphic Packs</MenuItem>
                   {graphicPacks.map((pack) => (
                     <MenuItem key={pack.id} value={pack.id}>
                       {pack.name}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} sm={6} md={3}>
               <FormControl fullWidth size="small">
                 <InputLabel>Element Name</InputLabel>
                 <Select
                   value={filters.element_name}
                   onChange={(e) => handleFilterChange('element_name', e.target.value)}
                   label="Element Name"
                 >
                   <MenuItem value="">All Element Names</MenuItem>
                   {elementNames.map((element) => (
                     <MenuItem key={element.value} value={element.value}>
                       {element.label}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12}>
               <Box display="flex" gap={1} flexWrap="wrap">
                 <Button
                   variant="outlined"
                   startIcon={<ClearIcon />}
                   onClick={clearFilters}
                   size="small"
                 >
                   Clear Filters
                 </Button>
                 {Object.values(filters).some(filter => filter !== '') && (
                   <Chip
                     label={`${Object.values(filters).filter(f => f !== '').length} filter(s) active`}
                     color="primary"
                     size="small"
                   />
                 )}
               </Box>
             </Grid>
           </Grid>
         </CardContent>
       </Card>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Graphic Pack</TableCell>
                <TableCell>Content Type</TableCell>
                <TableCell>Element Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Position (X, Y)</TableCell>
                <TableCell>Home/Away Position</TableCell>
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
                       <Chip 
                         label={element.element_type || 'text'} 
                         size="small" 
                         color={element.element_type === 'image' ? 'success' : 'primary'} 
                         variant="outlined"
                       />
                     </TableCell>
                     <TableCell>
                       ({element.position_x}, {element.position_y})
                     </TableCell>
                     <TableCell>
                       <Box>
                         <Typography variant="caption" display="block">
                           Home: ({element.home_position_x || element.position_x}, {element.home_position_y || element.position_y})
                         </Typography>
                         <Typography variant="caption" display="block">
                           Away: ({element.away_position_x || element.position_x}, {element.away_position_y || element.position_y})
                         </Typography>
                       </Box>
                     </TableCell>
                     <TableCell>
                       {element.element_type === 'image' ? 
                         `${element.image_width || 100}x${element.image_height || 100}px` : 
                         `${element.font_size}px`
                       }
                     </TableCell>
                     <TableCell>
                       {element.element_type === 'image' ? 
                         'Image' : 
                         element.font_family
                       }
                     </TableCell>
                     <TableCell>
                       {element.element_type === 'image' ? 
                         <Chip label="Image" size="small" color="success" variant="outlined" /> :
                         <Box
                           sx={{
                             width: 20,
                             height: 20,
                             backgroundColor: element.font_color,
                             border: '1px solid #ccc',
                             borderRadius: 1
                           }}
                         />
                       }
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
                   <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} elements
            </Typography>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: 'white' }}>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {editingElement ? 'Edit Element' : 'Add Element'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Graphic Pack</InputLabel>
              <Select
                value={formData.graphic_pack}
                onChange={(e) => setFormData({ ...formData, graphic_pack: e.target.value })}
                label="Graphic Pack"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                {(() => {
                  console.log('Rendering dropdown with graphicPacks:', graphicPacks);
                  console.log('graphicPacks is array:', Array.isArray(graphicPacks));
                  console.log('graphicPacks length:', graphicPacks.length);
                  
                  if (Array.isArray(graphicPacks) && graphicPacks.length > 0) {
                    return graphicPacks.map((pack) => {
                      console.log('Rendering pack:', pack);
                      return (
                        <MenuItem key={pack.id} value={pack.id}>
                          {pack.name}
                        </MenuItem>
                      );
                    });
                  } else {
                    return <MenuItem disabled>No graphic packs available ({graphicPacks.length})</MenuItem>;
                  }
                })()}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Element Type</InputLabel>
              <Select
                value={formData.element_type}
                onChange={(e) => setFormData({ ...formData, element_type: e.target.value })}
                label="Element Type"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="image">Image</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Content Type</InputLabel>
              <Select
                value={formData.content_type}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                label="Content Type"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                {contentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Element Name</InputLabel>
              <Select
                value={formData.element_name}
                onChange={(e) => setFormData({ ...formData, element_name: e.target.value })}
                label="Element Name"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
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
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Position X"
              type="number"
              value={formData.position_x}
              onChange={(e) => setFormData({ ...formData, position_x: parseInt(e.target.value) || 0 })}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Position Y"
              type="number"
              value={formData.position_y}
              onChange={(e) => setFormData({ ...formData, position_y: parseInt(e.target.value) || 0 })}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            {/* Home/Away positioning fields */}
            <TextField
              label="Home Position X"
              type="number"
              value={formData.home_position_x}
              onChange={(e) => setFormData({ ...formData, home_position_x: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="X position for home fixtures"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Home Position Y"
              type="number"
              value={formData.home_position_y}
              onChange={(e) => setFormData({ ...formData, home_position_y: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="Y position for home fixtures"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Away Position X"
              type="number"
              value={formData.away_position_x}
              onChange={(e) => setFormData({ ...formData, away_position_x: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="X position for away fixtures"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Away Position Y"
              type="number"
              value={formData.away_position_y}
              onChange={(e) => setFormData({ ...formData, away_position_y: parseInt(e.target.value) || 0 })}
              fullWidth
              helperText="Y position for away fixtures"
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Font Size"
              type="number"
              value={formData.font_size}
              onChange={(e) => setFormData({ ...formData, font_size: parseInt(e.target.value) || 12 })}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <TextField
              label="Font Color"
              type="color"
              value={formData.font_color}
              onChange={(e) => setFormData({ ...formData, font_color: e.target.value })}
              fullWidth
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                },
                '& .MuiInputBase-input': { color: 'white' },
                '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Position Alignment</InputLabel>
              <Select
                value={formData.alignment}
                onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                label="Position Alignment"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Text Alignment</InputLabel>
              <Select
                value={formData.text_alignment || 'center'}
                onChange={(e) => setFormData({ ...formData, text_alignment: e.target.value })}
                label="Text Alignment"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Font Weight</InputLabel>
              <Select
                value={formData.font_weight}
                onChange={(e) => setFormData({ ...formData, font_weight: e.target.value })}
                label="Font Weight"
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#2196f3',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="bold">Bold</MenuItem>
              </Select>
            </FormControl>

            {/* Image-specific fields - only show for image elements */}
            {formData.element_type === 'image' && (
              <>
                <TextField
                  label="Image Width"
                  type="number"
                  value={formData.image_width}
                  onChange={(e) => setFormData({ ...formData, image_width: parseInt(e.target.value) || 100 })}
                  fullWidth
                  helperText="Width in pixels"
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                    },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />

                <TextField
                  label="Image Height"
                  type="number"
                  value={formData.image_height}
                  onChange={(e) => setFormData({ ...formData, image_height: parseInt(e.target.value) || 100 })}
                  fullWidth
                  helperText="Height in pixels"
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#2196f3' }
                    },
                    '& .MuiInputBase-input': { color: 'white' },
                    '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.7)' }
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Maintain Aspect Ratio</InputLabel>
                  <Select
                    value={formData.maintain_aspect_ratio}
                    onChange={(e) => setFormData({ ...formData, maintain_aspect_ratio: e.target.value })}
                    label="Maintain Aspect Ratio"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196f3',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      }
                    }}
                  >
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<CancelIcon />}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData.graphic_pack || !formData.content_type || !formData.element_name || !formData.element_type}
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
