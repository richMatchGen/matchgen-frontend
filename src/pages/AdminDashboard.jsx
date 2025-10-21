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
  Visibility as ViewIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import apiClient from '../api/config';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchAdminData();
  }, []);

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
        </Box>
      </Box>
    </AppTheme>
  );
};

export default AdminDashboard;
