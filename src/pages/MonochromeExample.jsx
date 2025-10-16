import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  SportsSoccer as MatchIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  Upgrade as UpgradeIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import MonochromeTheme from '../themes/MonochromeTheme';
import MonochromeHeader from '../components/MonochromeHeader';
import MonochromeSidebar from '../components/MonochromeSidebar';

const MonochromeExample = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('dashboard');

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleItemClick = (path) => {
    setSelectedItem(path.replace('/', ''));
    console.log('Navigate to:', path);
  };

  const features = [
    {
      id: 'matchday',
      name: 'Matchday Posts',
      description: 'Create pre-match announcement posts',
      available: true,
      icon: <EventIcon />,
    },
    {
      id: 'goal',
      name: 'Goal Posts',
      description: 'Create goal celebration posts',
      available: false,
      requiredPlan: 'Prem Gen',
      icon: <LockIcon />,
    },
    {
      id: 'substitution',
      name: 'Substitution Posts',
      description: 'Create player substitution announcements',
      available: false,
      requiredPlan: 'SemiPro Gen',
      icon: <LockIcon />,
    },
    {
      id: 'team',
      name: 'Team Management',
      description: 'Manage team members and roles',
      available: false,
      requiredPlan: 'SemiPro Gen',
      icon: <LockIcon />,
    },
  ];

  return (
    <MonochromeTheme>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <MonochromeSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedItem={selectedItem}
          onItemClick={handleItemClick}
          userPlan="basic"
        />

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <MonochromeHeader
            title="MatchGen"
            onMenuClick={handleSidebarToggle}
            showMenuButton={true}
            rightActions={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  color="inherit"
                  sx={{
                    color: '#666666',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                      color: '#000000',
                    },
                  }}
                >
                  Account
                </Button>
                
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      backgroundColor: '#333333',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  Upgrade
                </Button>
              </Box>
            }
          />

          {/* Content */}
          <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
            <Container maxWidth="lg">
              {/* Hero Section */}
              <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    color: '#000000',
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  Professional Post Generation
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#666666',
                    fontWeight: 400,
                    maxWidth: '600px',
                    mx: 'auto',
                    lineHeight: 1.6,
                  }}
                >
                  Create professional social media posts for your club with our clean, modern interface
                </Typography>
              </Box>

              {/* Features Grid */}
              <Grid container spacing={3} sx={{ mb: 6 }}>
                {features.map((feature) => (
                  <Grid item xs={12} sm={6} md={3} key={feature.id}>
                    <Card
                      sx={{
                        height: '100%',
                        opacity: feature.available ? 1 : 0.6,
                        cursor: feature.available ? 'default' : 'not-allowed',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: feature.available 
                            ? '0 4px 12px rgba(0,0,0,0.1)' 
                            : '0 1px 3px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              color: feature.available ? '#000000' : '#cccccc',
                              mr: 2,
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: feature.available ? '#000000' : '#999999',
                            }}
                          >
                            {feature.name}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            color: feature.available ? '#666666' : '#999999',
                            mb: 3,
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>

                        {!feature.available && (
                          <Chip
                            label={`Requires ${feature.requiredPlan}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              backgroundColor: '#f5f5f5',
                              color: '#666666',
                              border: '1px solid #cccccc',
                              fontSize: '0.75rem',
                            }}
                          />
                        )}

                        <Button
                          variant={feature.available ? 'contained' : 'outlined'}
                          fullWidth
                          disabled={!feature.available}
                          sx={{
                            mt: 2,
                            backgroundColor: feature.available ? '#000000' : 'transparent',
                            color: feature.available ? '#ffffff' : '#999999',
                            borderColor: '#cccccc',
                            '&:hover': {
                              backgroundColor: feature.available ? '#333333' : 'transparent',
                            },
                            '&:disabled': {
                              borderColor: '#cccccc',
                              color: '#999999',
                            },
                          }}
                        >
                          {feature.available ? 'Use Feature' : 'Upgrade Required'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Upgrade Section */}
              <Card
                sx={{
                  backgroundColor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  textAlign: 'center',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <UpgradeIcon sx={{ color: '#666666', mr: 1, fontSize: '1.5rem' }} />
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        color: '#000000',
                      }}
                    >
                      Unlock All Features
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#666666',
                      mb: 3,
                      maxWidth: '500px',
                      mx: 'auto',
                    }}
                  >
                    Upgrade to SemiPro Gen or Prem Gen to access advanced features like goal posts, 
                    team management, and more.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#333333',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    View Pricing Plans
                  </Button>
                </CardContent>
              </Card>
            </Container>
          </Box>
        </Box>
      </Box>
    </MonochromeTheme>
  );
};

export default MonochromeExample;








