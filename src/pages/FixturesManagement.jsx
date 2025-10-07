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
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CssBaseline
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import axios from 'axios';
import EditFixtureModal from '../components/EditFixtureModal';
import AddFixtureModal from '../components/AddFixtureModal';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const FixturesManagement = () => {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fixtureToDelete, setFixtureToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch fixtures on component mount
  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        'https://matchgen-backend-production.up.railway.app/api/content/matches/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Handle paginated response
      let fixturesData = [];
      if (response.data && response.data.results) {
        fixturesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        fixturesData = response.data;
      }
      
      setFixtures(fixturesData);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load fixtures',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fixture) => {
    setSelectedFixture(fixture);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setSelectedFixture(null);
  };

  const handleEditUpdate = (updatedFixture) => {
    // Update the fixture in the local state
    setFixtures(prevFixtures => 
      prevFixtures.map(fixture => 
        fixture.id === updatedFixture.id ? updatedFixture : fixture
      )
    );
    
    setSnackbar({
      open: true,
      message: 'Fixture updated successfully!',
      severity: 'success'
    });
  };

  const handleDelete = (fixture) => {
    setFixtureToDelete(fixture);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fixtureToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `https://matchgen-backend-production.up.railway.app/api/content/matches/${fixtureToDelete.id}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove the fixture from local state
      setFixtures(prevFixtures => 
        prevFixtures.filter(fixture => fixture.id !== fixtureToDelete.id)
      );
      
      setSnackbar({
        open: true,
        message: 'Fixture deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting fixture:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete fixture',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setFixtureToDelete(null);
    }
  };

  const handleAddFixture = () => {
    // Refresh the list after adding a new fixture
    fetchFixtures();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBC';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBC';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
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
          <Box sx={{ p: 3 }}>
            <Header />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Fixtures Management
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchFixtures}
                >
                  Refresh
                </Button>
                <AddFixtureModal onFixtureAdded={handleAddFixture} />
              </Box>
            </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Opponent</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Home/Away</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Venue</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Logo</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fixtures.length > 0 ? (
                fixtures.map((fixture) => (
                  <TableRow key={fixture.id} hover>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {fixture.opponent || 'Opponent TBC'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={fixture.match_type || 'N/A'} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={fixture.home_away || 'N/A'} 
                        size="small" 
                        color={fixture.home_away === 'HOME' ? 'success' : 'warning'} 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(fixture.date)}
                    </TableCell>
                    <TableCell>
                      {formatTime(fixture.time_start)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {fixture.venue || 'Venue TBC'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {fixture.location || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {fixture.opponent_logo ? (
                        <Box
                          component="img"
                          src={fixture.opponent_logo}
                          alt={`${fixture.opponent} logo`}
                          sx={{ width: 40, height: 40, borderRadius: 1 }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No logo
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(fixture)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(fixture)}
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
                      No fixtures found. Click "Create Fixture" to add your first one.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Fixture Modal */}
      <EditFixtureModal
        open={editModalOpen}
        onClose={handleEditClose}
        fixture={selectedFixture}
        onUpdate={handleEditUpdate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ color: 'white' }}>Delete Fixture</DialogTitle>
        <DialogContent sx={{ color: 'white' }}>
          <DialogContentText sx={{ color: 'white' }}>
            Are you sure you want to delete the fixture against{' '}
            <strong style={{ color: 'white' }}>{fixtureToDelete?.opponent}</strong> on{' '}
            <strong style={{ color: 'white' }}>{fixtureToDelete?.date ? formatDate(fixtureToDelete.date) : 'TBC'}</strong>?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
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
        </Box>
      </Box>
    </AppTheme>
  );
};

export default FixturesManagement;

