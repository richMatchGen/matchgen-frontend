import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Paper,
  Grid
} from '@mui/material';
import {
  SearchOff as SearchOffIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Camera as CameraIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import { CssBaseline } from '@mui/material';
import { alpha } from '@mui/material/styles';

const Error404 = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const quickLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, link: '/dashboard' },
    { text: 'Club', icon: <PeopleIcon />, link: '/club' },
    { text: 'Templates', icon: <AssignmentIcon />, link: '/gen/templates' },
    { text: 'Media Manager', icon: <CameraIcon />, link: '/media-manager' }
  ];

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
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })}
        >
          <Container maxWidth="lg">
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Header />
              
              {/* Error Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SearchOffIcon sx={{ fontSize: 120, color: 'warning.main', opacity: 0.8 }} />
              </Box>

              {/* Error Content */}
              <Card sx={{ p: 4, maxWidth: 600, width: '100%' }}>
                <CardContent>
                  <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    404
                  </Typography>
                  <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Page Not Found
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Sorry, we couldn't find the page you're looking for.
                  </Typography>
                  
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      The page you requested might have been:
                    </Typography>
                    <Box component="ul" sx={{ mt: 2, pl: 3, textAlign: 'left' }}>
                      <li>Moved to a different location</li>
                      <li>Deleted or no longer available</li>
                      <li>Accessible only to authenticated users</li>
                      <li>Under maintenance</li>
                    </Box>
                  </Paper>

                  {/* Action Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 4 }}>
                    <Button
                      variant="contained"
                      startIcon={<HomeIcon />}
                      component={RouterLink}
                      to="/dashboard"
                      size="large"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<BackIcon />}
                      onClick={handleGoBack}
                      size="large"
                    >
                      Go Back
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefresh}
                      size="large"
                    >
                      Refresh Page
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Paper sx={{ p: 4, width: '100%', maxWidth: 800 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  Popular Pages
                </Typography>
                <Grid container spacing={2}>
                  {quickLinks.map((link, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Button
                        component={RouterLink}
                        to={link.link}
                        variant="outlined"
                        startIcon={link.icon}
                        fullWidth
                        sx={{ 
                          p: 2, 
                          height: 'auto',
                          flexDirection: 'column',
                          gap: 1
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {link.text}
                        </Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              {/* Help Section */}
              <Paper sx={{ p: 3, bgcolor: 'primary.50', width: '100%', maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Still Can't Find What You're Looking For?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Try using the navigation menu or contact our support team for assistance.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    variant="text"
                    component={RouterLink}
                    to="/feedback"
                    sx={{ textTransform: 'none' }}
                  >
                    Contact Support
                  </Button>
                  <Button
                    variant="text"
                    component={RouterLink}
                    to="/about"
                    sx={{ textTransform: 'none' }}
                  >
                    Learn More About MatchGen
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default Error404;


