import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Upgrade as UpgradeIcon,
  Close as CloseIcon,
  Payment as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppTheme from '../themes/AppTheme';
import SideMenu from './SideMenu';
import AppNavbar from './AppNavBar';
import Header from './Header';
import stripeService from '../services/stripeService';

import env from '../config/environment';
const FeatureCatalog = () => {
  const [featureCatalog, setFeatureCatalog] = useState(null);
  const [clubFeatures, setClubFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchFeatureCatalog();
    fetchClubFeatures();
  }, []);

  const fetchFeatureCatalog = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? '${env.API_BASE_URL}/'
        : 'http://localhost:8000/api/';
        
      const response = await axios.get(
        `${API_BASE_URL}users/feature-catalog/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setFeatureCatalog(response.data);
    } catch (error) {
      console.error('Error fetching feature catalog:', error);
      setError('Failed to load feature catalog');
    }
  };

  const fetchClubFeatures = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      let clubId = localStorage.getItem('selectedClubId');
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? '${env.API_BASE_URL}/'
        : 'http://localhost:8000/api/';
      
      // If no club ID, try to fetch it first
      if (!clubId) {
        try {
          const clubResponse = await axios.get(
            `${API_BASE_URL}users/my-club/`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (clubResponse.data && clubResponse.data.id) {
            clubId = clubResponse.data.id.toString();
            localStorage.setItem('selectedClubId', clubId);
          }
        } catch (clubError) {
          console.warn('User might not have a club yet:', clubError);
          // Set default features for users without clubs
          setClubFeatures({
            subscription_tier: 'basic',
            subscription_active: false,
            feature_access: {}
          });
          setLoading(false);
          return;
        }
      }
      
      // Only fetch feature access if we have a valid club ID
      if (clubId && clubId !== 'null') {
        const response = await axios.get(
          `${API_BASE_URL}users/feature-access/?club_id=${clubId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setClubFeatures(response.data);
      } else {
        // Set default features for users without clubs
        setClubFeatures({
          subscription_tier: 'basic',
          subscription_active: false,
          feature_access: {}
        });
      }
    } catch (error) {
      console.error('Error fetching club features:', error);
      // Set default features on error
      setClubFeatures({
        subscription_tier: 'basic',
        subscription_active: false,
        feature_access: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (tier) => {
    setSelectedTier(tier);
    setUpgradeDialogOpen(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedTier) return;
    
    try {
      setUpdating(true);
      const clubId = localStorage.getItem('selectedClubId');
      
      // Redirect to Stripe checkout
      await stripeService.redirectToCheckout(selectedTier, clubId);
      
      // Note: The page will redirect to Stripe, so we don't need to handle the response here
      // The webhook will handle the subscription update when payment is completed
      
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to redirect to payment. Please try again.');
      setUpdating(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'prem': return 'warning';
      case 'semipro': return 'secondary';
      default: return 'primary';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'prem': return <StarIcon />;
      case 'semipro': return <UpgradeIcon />;
      default: return <InfoIcon />;
    }
  };

  const groupFeaturesByCategory = (features) => {
    const categories = {
      'Post Types': [],
      'Team Management': [],
      'Templates': [],
      'Analytics': [],
      'Support': [],
      'Advanced Features': []
    };

    features.forEach(feature => {
      if (feature.code.startsWith('post.')) {
        categories['Post Types'].push(feature);
      } else if (feature.code.startsWith('team.')) {
        categories['Team Management'].push(feature);
      } else if (feature.code.startsWith('template.')) {
        categories['Templates'].push(feature);
      } else if (feature.code.startsWith('analytics.')) {
        categories['Analytics'].push(feature);
      } else if (feature.code.startsWith('support.')) {
        categories['Support'].push(feature);
      } else {
        categories['Advanced Features'].push(feature);
      }
    });

    return categories;
  };

  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Header title="Feature Catalog" />
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
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
          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Header title="Feature Catalog" />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Alert severity="error">{error}</Alert>
            </Container>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  const currentTier = clubFeatures?.subscription_tier || 'basic';
  const featureCategories = featureCatalog ? groupFeaturesByCategory(featureCatalog.features) : {};

  return (
    <AppTheme>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Feature Catalog" />
          
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Current Club Status */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Typography variant="h5" fontWeight="bold">
                        Current Plan: {clubFeatures?.club_name}
                      </Typography>
                      <Chip 
                        label={featureCatalog?.tier_info[currentTier]?.name || currentTier.toUpperCase()} 
                        color={getTierColor(currentTier)}
                        icon={getTierIcon(currentTier)}
                        variant="outlined"
                      />
                      {clubFeatures?.subscription_active ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="error" size="small" />
                      )}
                    </Box>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {featureCatalog?.tier_info[currentTier]?.description}
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Your Available Features ({clubFeatures?.available_features?.length || 0}):
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {clubFeatures?.available_features?.map((featureCode, index) => {
                        const feature = featureCatalog?.features.find(f => f.code === featureCode);
                        return feature ? (
                          <Grid item key={index}>
                            <Chip 
                              label={feature.name} 
                              color="success" 
                              size="small"
                              icon={<CheckIcon />}
                            />
                          </Grid>
                        ) : null;
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Feature Catalog by Category */}
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                  Complete Feature Catalog
                </Typography>
                
                {Object.entries(featureCategories).map(([category, features]) => (
                  <Accordion key={category} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6">{category}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Feature</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell align="center">Basic</TableCell>
                              <TableCell align="center">SemiPro</TableCell>
                              <TableCell align="center">Prem</TableCell>
                              <TableCell align="center">Your Access</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {features.map((feature) => {
                              const hasAccess = clubFeatures?.feature_access?.[feature.code] || false;
                              const availableInTiers = feature.available_in_tiers || [];
                              
                              return (
                                <TableRow key={feature.code}>
                                  <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                      <Typography variant="body2" fontWeight="medium">
                                        {feature.name}
                                      </Typography>
                                      {hasAccess ? (
                                        <Tooltip title="You have access to this feature">
                                          <LockOpenIcon color="success" fontSize="small" />
                                        </Tooltip>
                                      ) : (
                                        <Tooltip title="Upgrade to access this feature">
                                          <LockIcon color="disabled" fontSize="small" />
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {feature.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    {availableInTiers.includes('basic') ? (
                                      <CheckIcon color="success" />
                                    ) : (
                                      <CancelIcon color="disabled" />
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    {availableInTiers.includes('semipro') ? (
                                      <CheckIcon color="success" />
                                    ) : (
                                      <CancelIcon color="disabled" />
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    {availableInTiers.includes('prem') ? (
                                      <CheckIcon color="success" />
                                    ) : (
                                      <CancelIcon color="disabled" />
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    {hasAccess ? (
                                      <Chip label="Available" color="success" size="small" />
                                    ) : (
                                      <Chip label="Locked" color="default" size="small" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>

              {/* Subscription Tiers */}
              <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                  Subscription Tiers
                </Typography>
                
                <Grid container spacing={3}>
                  {['basic', 'semipro', 'prem'].map((tier) => {
                    const tierInfo = featureCatalog?.tier_info[tier];
                    const isCurrentTier = tier === currentTier;
                    const isUpgrade = ['basic', 'semipro', 'prem'].indexOf(tier) > ['basic', 'semipro', 'prem'].indexOf(currentTier);
                    
                    return (
                      <Grid item xs={12} md={4} key={tier}>
                        <Card 
                          elevation={isCurrentTier ? 4 : 1}
                          sx={{ 
                            height: '100%',
                            border: isCurrentTier ? 2 : 1,
                            borderColor: isCurrentTier ? 'primary.main' : 'divider',
                            position: 'relative'
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <Typography variant="h5" fontWeight="bold">
                                {tierInfo?.name}
                              </Typography>
                              {isCurrentTier && (
                                <Chip label="Current" color="primary" size="small" />
                              )}
                            </Box>
                            
                            <Typography variant="h4" color="primary" gutterBottom>
                              {tierInfo?.price}/{tierInfo?.period}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {tierInfo?.description}
                            </Typography>

                            <Typography variant="h6" gutterBottom>
                              Features:
                            </Typography>
                            
                            <List dense sx={{ mb: 2 }}>
                              {featureCatalog?.tier_mappings[tier]?.slice(0, 5).map((feature, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <CheckIcon color="success" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={feature.name} />
                                </ListItem>
                              ))}
                              {featureCatalog?.tier_mappings[tier]?.length > 5 && (
                                <ListItem sx={{ py: 0 }}>
                                  <ListItemText 
                                    primary={`+${featureCatalog.tier_mappings[tier].length - 5} more features`}
                                    sx={{ fontStyle: 'italic' }}
                                  />
                                </ListItem>
                              )}
                            </List>

                            <Button
                              variant={isCurrentTier ? "outlined" : "contained"}
                              fullWidth
                              disabled={isCurrentTier}
                              onClick={() => handleUpgrade(tier)}
                              startIcon={isCurrentTier ? null : <UpgradeIcon />}
                            >
                              {isCurrentTier ? 'Current Plan' : 'Upgrade'}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Upgrade Dialog */}
      <Dialog 
        open={upgradeDialogOpen} 
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Upgrade Subscription</Typography>
            <IconButton onClick={() => setUpgradeDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTier && featureCatalog?.tier_info[selectedTier] && (
            <Box>
              <Typography variant="h5" color="primary" gutterBottom>
                {featureCatalog.tier_info[selectedTier].name}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {featureCatalog.tier_info[selectedTier].price}/{featureCatalog.tier_info[selectedTier].period}
              </Typography>
              <Typography variant="body1" paragraph>
                {featureCatalog.tier_info[selectedTier].description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                New Features You'll Get:
              </Typography>
              <List dense>
                {featureCatalog.tier_mappings[selectedTier]?.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature.name} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmUpgrade}
            disabled={updating}
            startIcon={updating ? <CircularProgress size={16} /> : <PaymentIcon />}
          >
            {updating ? 'Upgrading...' : 'Upgrade Now'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppTheme>
  );
};

export default FeatureCatalog;
