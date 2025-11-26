import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Paper
} from '@mui/material';
import {
  Error as ErrorIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import { CssBaseline } from '@mui/material';
import { alpha } from '@mui/material/styles';

const Error400 = () => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
          <Container maxWidth="md">
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Header />
              
              {/* Error Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ErrorIcon sx={{ fontSize: 120, color: 'error.main', opacity: 0.8 }} />
              </Box>

              {/* Error Content */}
              <Card sx={{ p: 4, maxWidth: 600, width: '100%' }}>
                <CardContent>
                  <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    400
                  </Typography>
                  <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Bad Request
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    We're sorry, but the request you made was invalid or malformed.
                  </Typography>
                  
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      This usually happens when:
                    </Typography>
                    <Box component="ul" sx={{ mt: 2, pl: 3, textAlign: 'left' }}>
                      <li>Required form fields are missing</li>
                      <li>Invalid data format was submitted</li>
                      <li>File uploads exceed size limits</li>
                      <li>Authentication tokens have expired</li>
                    </Box>
                  </Paper>

                  {/* Action Buttons */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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

              {/* Help Section */}
              <Paper sx={{ p: 3, bgcolor: 'primary.50', width: '100%', maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Need Help?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  If you continue to experience issues, please contact our support team.
                </Typography>
                <Button
                  variant="text"
                  component={RouterLink}
                  to="/feedback"
                  sx={{ textTransform: 'none' }}
                >
                  Contact Support
                </Button>
              </Paper>
            </Stack>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default Error400;








