import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Container,
  Paper,
  Avatar,
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const Settings = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('account');

  const settingsSections = [
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Manage your personal information and preferences',
      icon: <PersonIcon />,
      color: 'primary',
      route: '/settings/account'
    },
    {
      id: 'club',
      title: 'Club Management',
      description: 'Update club details, logo, and branding',
      icon: <BusinessIcon />,
      color: 'secondary',
      route: '/settings/club'
    },
    {
      id: 'subscription',
      title: 'Subscription & Billing',
      description: 'Manage your subscription plan and payment methods',
      icon: <CreditCardIcon />,
      color: 'warning',
      route: '/subscription'
    },
    {
      id: 'team',
      title: 'Team & Roles',
      description: 'Manage team members and their permissions',
      icon: <GroupIcon />,
      color: 'info',
      route: '/settings/team'
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password, two-factor authentication, and security settings',
      icon: <SecurityIcon />,
      color: 'error',
      route: '/settings/security'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email preferences and notification settings',
      icon: <NotificationsIcon />,
      color: 'success',
      route: '/settings/notifications'
    }
  ];

  const handleSectionClick = (section) => {
    setSelectedSection(section.id);
    navigate(section.route);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppTheme>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Settings" />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Settings Navigation */}
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Settings
                    </Typography>
                    
                                         <List>
                       {settingsSections.map((section, index) => (
                         <React.Fragment key={section.id}>
                           <ListItem disablePadding>
                             <ListItemButton
                               selected={selectedSection === section.id}
                               onClick={() => handleSectionClick(section)}
                               sx={{
 
                                 mb: 0.5,
                                 '&.Mui-selected': {
                                   backgroundColor: `${section.color}.50`,
                                   '&:hover': {
                                     backgroundColor: `${section.color}.100`,
                                   }
                                 }
                               }}
                             >
                              <ListItemIcon sx={{ color: `${section.color}.main` }}>
                                {section.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={section.title}
                                secondary={section.description}
                                primaryTypographyProps={{ fontWeight: 'medium' }}
                              />
                              <ArrowForwardIcon color="action" />
                            </ListItemButton>
                          </ListItem>
                          {index < settingsSections.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Main Content Area */}
              <Grid item xs={12} md={8}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <SettingsIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Settings Dashboard
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage your account, club, and preferences
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body1" paragraph>
                      Welcome to your settings dashboard. Use the navigation panel to access different settings sections:
                    </Typography>

                    <Grid container spacing={2}>
                      {settingsSections.map((section) => (
                        <Grid item xs={12} sm={6} key={section.id}>
                                                     <Paper
                             elevation={1}
                             sx={{
                               p: 2,
                               cursor: 'pointer',
                               transition: 'all 0.2s',

                               '&:hover': {
                                 elevation: 3,
                                 transform: 'translateY(-2px)'
                               }
                             }}
                             onClick={() => handleSectionClick(section)}
                           >
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: `${section.color}.main`, width: 40, height: 40 }}>
                                {section.icon}
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight="medium">
                                  {section.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {section.description}
                                </Typography>
                              </Box>
                              <ArrowForwardIcon color="action" />
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    <Box mt={4}>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Current Plan
                            </Typography>
                            <Chip label="Prem Gen" color="warning" variant="outlined" />
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Team Members
                            </Typography>
                            <Typography variant="h6" color="primary">
                              1 Active
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </AppTheme>
    </Box>
  );
};

export default Settings;
