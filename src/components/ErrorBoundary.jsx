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
  BugReport as BugIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and any error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 2
          }}
        >
          <Container maxWidth="md">
            <Stack spacing={4} alignItems="center" textAlign="center">
              {/* Error Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BugIcon sx={{ fontSize: 120, color: 'error.main', opacity: 0.8 }} />
              </Box>

              {/* Error Content */}
              <Card sx={{ p: 4, maxWidth: 600, width: '100%' }}>
                <CardContent>
                  <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Oops!
                  </Typography>
                  <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Something Went Wrong
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    We encountered an unexpected error. Don't worry, our team has been notified.
                  </Typography>
                  
                  <Paper sx={{ p: 3, bgcolor: 'grey.50', mb: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      This error might be caused by:
                    </Typography>
                    <Box component="ul" sx={{ mt: 2, pl: 3, textAlign: 'left' }}>
                      <li>Network connectivity issues</li>
                      <li>Browser compatibility problems</li>
                      <li>Temporary application issues</li>
                      <li>Outdated browser cache</li>
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
                      onClick={this.handleGoBack}
                      size="large"
                    >
                      Go Back
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={this.handleRefresh}
                      size="large"
                    >
                      Refresh Page
                    </Button>
                  </Stack>

                  {/* Error Details (Development Only) */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <Paper sx={{ p: 3, bgcolor: 'error.50', mt: 3 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Error Details (Development)
                      </Typography>
                      <Typography variant="body2" component="pre" sx={{ 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}>
                        {this.state.error.toString()}
                      </Typography>
                      {this.state.errorInfo && (
                        <Typography variant="body2" component="pre" sx={{ 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          mt: 2
                        }}>
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      )}
                    </Paper>
                  )}
                </CardContent>
              </Card>

              {/* Help Section */}
              <Paper sx={{ p: 3, bgcolor: 'primary.50', width: '100%', maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Need Help?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  If this error continues to occur, please contact our support team with details about what you were doing when the error occurred.
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
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;



