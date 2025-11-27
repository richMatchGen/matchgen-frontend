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
  Divider,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  SportsSoccer as SportsIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
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

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fixtureTasks, setFixtureTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [selectedPostType, setSelectedPostType] = useState('');
  const [postUrl, setPostUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/users/admin/dashboard/');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFixtureTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await apiClient.get('/users/admin/fixture-tasks/');
      setFixtureTasks(response.data.fixtures || []);
    } catch (err) {
      console.error('Error fetching fixture tasks:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load fixture tasks',
        severity: 'error'
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchFixtureTasks();
  }, []);

  const handleUploadClick = (fixture, postType) => {
    setSelectedFixture(fixture);
    setSelectedPostType(postType);
    setPostUrl(fixture[`${postType}_post_url`] || '');
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleUploadSubmit = async () => {
    if (!postUrl.trim() && !selectedFile) {
      setSnackbar({
        open: true,
        message: 'Please provide a post URL or upload an image file',
        severity: 'error'
      });
      return;
    }

    try {
      setUploading(true);
      if (selectedFile) {
        const formData = new FormData();
        formData.append('fixture_id', selectedFixture.id);
        formData.append('post_type', selectedPostType);
        formData.append('file', selectedFile);
        if (postUrl.trim()) {
          formData.append('post_url', postUrl.trim());
        }
        await apiClient.post('/users/admin/upload-post/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiClient.post('/users/admin/upload-post/', {
          fixture_id: selectedFixture.id,
          post_type: selectedPostType,
          post_url: postUrl.trim()
        });
      }
      
      setSnackbar({
        open: true,
        message: `${selectedPostType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} post uploaded successfully`,
        severity: 'success'
      });
      
      setUploadDialogOpen(false);
      setPostUrl('');
      setSelectedFile(null);
      fetchFixtureTasks(); // Refresh the task list
    } catch (err) {
      console.error('Error uploading post:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to upload post',
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      setPostUrl('');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPostStatus = (fixture, postType) => {
    const url = fixture[`${postType}_post_url`];
    return url ? 'completed' : 'pending';
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

  if (error) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <AppNavbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button onClick={fetchAdminData} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  const { stats, clubs, recent_activity, admin_user } = dashboardData;

  return (
    <AppTheme>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AdminIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Welcome, {admin_user.email} • System Overview
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchAdminData}
              >
                Refresh
              </Button>
            </Stack>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PeopleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.users.total}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        {stats.users.active} active
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SportsIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.clubs.total}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Clubs
                      </Typography>
                      <Typography variant="caption" color="info.main">
                        {stats.clubs.with_logos} with logos
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.content.matches}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Matches
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.content.players} players
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <DashboardIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{stats.graphic_packs.total}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Graphic Packs
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stats.graphic_packs.media_items} media items
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Fixture Tasks Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="h6">
                        Upcoming Fixtures - Premium Bespoke Clubs
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={fetchFixtureTasks}
                      disabled={loadingTasks}
                    >
                      Refresh Tasks
                    </Button>
                  </Box>
                  
                  {loadingTasks ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                      <CircularProgress />
                    </Box>
                  ) : fixtureTasks.length === 0 ? (
                    <Alert severity="info">
                      No upcoming fixtures found for Premium clubs with Bespoke template packages.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Club</TableCell>
                            <TableCell>Opponent</TableCell>
                            <TableCell>Date & Time</TableCell>
                            <TableCell>Graphic Pack</TableCell>
                            <TableCell>Matchday</TableCell>
                            <TableCell>Upcoming Fixture</TableCell>
                            <TableCell>Starting XI</TableCell>
                            <TableCell>Halftime</TableCell>
                            <TableCell>Fulltime</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fixtureTasks.map((fixture) => (
                            <TableRow key={fixture.id}>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {fixture.club_logo && (
                                    <Avatar
                                      src={fixture.club_logo}
                                      sx={{ width: 32, height: 32 }}
                                    />
                                  )}
                                  <Typography variant="body2" fontWeight="medium">
                                    {fixture.club_name}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {fixture.opponent_logo && (
                                    <Avatar
                                      src={fixture.opponent_logo}
                                      sx={{ width: 24, height: 24 }}
                                    />
                                  )}
                                  <Typography variant="body2">
                                    {fixture.opponent}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {formatDate(fixture.date)}
                                </Typography>
                                {fixture.time_start && (
                                  <Typography variant="caption" color="text.secondary">
                                    {fixture.time_start}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={fixture.graphic_pack_name || 'N/A'}
                                  color="warning"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getPostStatus(fixture, 'matchday') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getPostStatus(fixture, 'matchday') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(fixture, 'matchday')}
                                  >
                                    {getPostStatus(fixture, 'matchday') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getPostStatus(fixture, 'upcoming_fixture') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getPostStatus(fixture, 'upcoming_fixture') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(fixture, 'upcoming_fixture')}
                                  >
                                    {getPostStatus(fixture, 'upcoming_fixture') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getPostStatus(fixture, 'starting_xi') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getPostStatus(fixture, 'starting_xi') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(fixture, 'starting_xi')}
                                  >
                                    {getPostStatus(fixture, 'starting_xi') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getPostStatus(fixture, 'halftime') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getPostStatus(fixture, 'halftime') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(fixture, 'halftime')}
                                  >
                                    {getPostStatus(fixture, 'halftime') === 'completed' ? 'Update' : 'Upload'}
                                  </Button>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  {getPostStatus(fixture, 'fulltime') === 'completed' ? (
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                  ) : (
                                    <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  )}
                                  <Button
                                    size="small"
                                    variant={getPostStatus(fixture, 'fulltime') === 'completed' ? 'outlined' : 'contained'}
                                    startIcon={<UploadIcon />}
                                    onClick={() => handleUploadClick(fixture, 'fulltime')}
                                  >
                                    {getPostStatus(fixture, 'fulltime') === 'completed' ? 'Update' : 'Upload'}
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

          <Grid container spacing={3}>
            {/* Graphic Packs Management */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Graphic Packs Management
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Pack Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Assigned Club</TableCell>
                          <TableCell>Sport</TableCell>
                          <TableCell>Tier</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dashboardData?.graphic_packs?.map((pack) => (
                          <TableRow key={pack.id}>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {pack.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {pack.description || 'No description'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={pack.is_bespoke ? 'Bespoke' : 'Public'}
                                color={pack.is_bespoke ? 'warning' : 'primary'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {pack.assigned_club_name || 'All clubs'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={pack.sport || 'N/A'}
                                color="secondary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={pack.tier || 'N/A'}
                                color="info"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={pack.is_active ? 'Active' : 'Inactive'}
                                color={pack.is_active ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Pack Details">
                                <IconButton size="small">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Pack">
                                <IconButton size="small">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Clubs Management */}
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Clubs Management ({clubs.length} clubs)
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Club</TableCell>
                          <TableCell>Owner</TableCell>
                          <TableCell>Sport</TableCell>
                          <TableCell>Matches</TableCell>
                          <TableCell>Players</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clubs.map((club) => (
                          <TableRow key={club.id}>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {club.logo && (
                                  <Avatar
                                    src={club.logo}
                                    sx={{ width: 32, height: 32 }}
                                  />
                                )}
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {club.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {club.location || 'No location'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {club.user_email}
                              </Typography>
                              <Chip
                                size="small"
                                label={club.user_active ? 'Active' : 'Inactive'}
                                color={club.user_active ? 'success' : 'error'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={club.sport}
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{club.matches_count}</TableCell>
                            <TableCell>{club.players_count}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={club.subscription_active ? 'Subscribed' : 'Free'}
                                color={club.subscription_active ? 'success' : 'default'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Club Details">
                                <IconButton size="small">
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Upload Graphics">
                                <IconButton size="small">
                                  <UploadIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  <Stack spacing={2}>
                    {recent_activity.slice(0, 5).map((activity, index) => (
                      <Box key={index}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            size="small"
                            label={activity.type.replace('_', ' ')}
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {activity.club_name} vs {activity.opponent}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(activity.date).toLocaleDateString()}
                        </Typography>
                        {index < recent_activity.slice(0, 5).length - 1 && (
                          <Divider sx={{ mt: 1 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Upload Dialog */}
          <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              Upload {selectedPostType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Post
            </DialogTitle>
            <DialogContent>
              {selectedFixture && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Club: {selectedFixture.club_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fixture: vs {selectedFixture.opponent} on {formatDate(selectedFixture.date)}
                  </Typography>
                </Box>
              )}
              <TextField
                fullWidth
                label="Post URL"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://example.com/post-image.jpg"
                margin="normal"
                disabled={Boolean(selectedFile)}
              />
              <Typography variant="caption" color="text.secondary">
                Paste an existing URL or upload an image file below.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  disabled={uploading}
                >
                  {selectedFile ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Selected: {selectedFile.name}
                    </Typography>
                    <IconButton size="small" onClick={() => setSelectedFile(null)} disabled={uploading}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
                Cancel
              </Button>
              <Button
                onClick={handleUploadSubmit}
                variant="contained"
                disabled={uploading || (!postUrl.trim() && !selectedFile)}
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

export default AdminDashboard;
