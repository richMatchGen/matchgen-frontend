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
  DialogActions
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Upgrade as UpgradeIcon,
  Close as CloseIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import stripeService from '../services/stripeService';

const SubscriptionManagement = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      let clubId = localStorage.getItem('selectedClubId');
      
      // If no club ID, try to fetch it first
      if (!clubId) {
        try {
          const API_BASE_URL = import.meta.env.MODE === 'production' 
            ? 'https://matchgen-backend-production.up.railway.app/api/'
            : 'http://localhost:8000/api/';
            
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
          // Set default subscription info for users without clubs
          setSubscriptionInfo({
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
        const API_BASE_URL = import.meta.env.MODE === 'production' 
          ? 'https://matchgen-backend-production.up.railway.app/api/'
          : 'http://localhost:8000/api/';
          
        const response = await axios.get(
          `${API_BASE_URL}users/feature-access/?club_id=${clubId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setSubscriptionInfo(response.data);
      } else {
        // Set default subscription info for users without clubs
        setSubscriptionInfo({
          subscription_tier: 'basic',
          subscription_active: false,
          feature_access: {}
        });
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      setError('Failed to load subscription information');
      
      // Set default subscription info on error
      setSubscriptionInfo({
        subscription_tier: 'basic',
        subscription_active: false,
        feature_access: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionTierInfo = (tier) => {
    const tiers = {
      basic: {
        name: 'Basic Gen',
        price: '£9.99',
        period: 'month',
        description: 'Perfect for small clubs getting started',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts', 
          'Starting XI Posts',
          '1 Team',
          'Basic Templates'
        ],
        color: 'primary'
      },
      semipro: {
        name: 'SemiPro Gen',
        price: '£14.99',
        period: 'month',
        description: 'Ideal for growing clubs with more content needs',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts',
          '1 Team',
          'Enhanced Templates'
        ],
        color: 'secondary'
      },
      prem: {
        name: 'Prem Gen',
        price: '£24.99',
        period: 'month',
        description: 'Complete solution for professional clubs',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts',
          'Goal Posts',
          'Player of the Match Posts',
          'Multiple Teams',
          'Bespoke Templates',
          'Priority Support'
        ],
        color: 'warning'
      }
    };
    return tiers[tier] || tiers.basic;
  };

  const tierOrder = ['basic', 'semipro', 'prem'];
  
  const getNextTier = (currentTier) => {
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  };

  const handleUpgrade = (tier) => {
    setSelectedTier(tier);
    setUpgradeDialogOpen(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedTier) return;
    
    try {
      const clubId = localStorage.getItem('selectedClubId');
      
      // Redirect to Stripe checkout
      await stripeService.redirectToCheckout(selectedTier, clubId);
      
      // Note: The page will redirect to Stripe, so we don't need to handle the response here
      // The webhook will handle the subscription update when payment is completed
      
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to redirect to payment. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const currentTier = subscriptionInfo?.subscription_tier || 'basic';
  const currentTierInfo = getSubscriptionTierInfo(currentTier);
  const nextTier = getNextTier(currentTier);
  const nextTierInfo = nextTier ? getSubscriptionTierInfo(nextTier) : null;
  const clubId = localStorage.getItem('selectedClubId');

  return (
    <Box sx={{ display: 'flex' }}>
      <AppTheme>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Subscription Management" />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Show message for users without clubs */}
            {(!clubId || clubId === 'null') && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>No Club Found</strong>
                </Typography>
                <Typography variant="body2">
                  You need to create a club first before managing subscriptions. 
                  <Button 
                    variant="text" 
                    color="primary" 
                    onClick={() => window.location.href = '/clubs/createclub'}
                    sx={{ ml: 1 }}
                  >
                    Create Club
                  </Button>
                </Typography>
              </Alert>
            )}
            <Grid container spacing={3}>
              {/* Current Plan */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Typography variant="h5" fontWeight="bold">
                        Current Plan
                      </Typography>
                      <Chip 
                        label={currentTierInfo.name} 
                        color={currentTierInfo.color}
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="h4" color="primary" gutterBottom>
                      {currentTierInfo.price}/{currentTierInfo.period}
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {currentTierInfo.description}
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                      Your Features:
                    </Typography>
                    
                    <List dense>
                      {currentTierInfo.features.map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>

                    {subscriptionInfo?.subscription_active === false && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Your subscription is currently inactive. Please contact support.
                      </Alert>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PaymentIcon />}
                        onClick={async () => {
                          try {
                            console.log('Manage Billing button clicked');
                            const clubId = localStorage.getItem('selectedClubId');
                            console.log('Club ID:', clubId);
                            await stripeService.redirectToBillingPortal(clubId);
                          } catch (error) {
                            console.error('Error redirecting to billing portal:', error);
                            alert('Failed to open billing portal. Please try again.');
                          }
                        }}
                        fullWidth
                      >
                        Manage Billing
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Available Plans */}
              <Grid item xs={12} md={6}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Available Plans
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Choose the plan that best fits your club's needs
                    </Typography>

                    {['basic', 'semipro', 'prem'].map((tier) => {
                      const tierInfo = getSubscriptionTierInfo(tier);
                      const isCurrentTier = tier === currentTier;
                      const isUpgrade = tierOrder.indexOf(tier) > tierOrder.indexOf(currentTier);
                      
                      return (
                        <Paper 
                          key={tier} 
                          elevation={isCurrentTier ? 4 : 1}
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                          
                            border: isCurrentTier ? 2 : 1,
                            borderColor: isCurrentTier ? 'primary.main' : 'divider',
                            position: 'relative'
                          }}
                        >
                          {isCurrentTier && (
                            <Chip 
                              label="Current Plan" 
                              color="primary" 
                              size="small"
                              sx={{ position: 'absolute', top: 8, right: 8 }}
                            />
                          )}
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6" fontWeight="bold">
                              {tierInfo.name}
                            </Typography>
                            <Typography variant="h5" color="primary">
                              {tierInfo.price}/{tierInfo.period}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {tierInfo.description}
                          </Typography>

                          <List dense sx={{ mb: 2 }}>
                            {tierInfo.features.slice(0, 3).map((feature, index) => (
                              <ListItem key={index} sx={{ py: 0 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <CheckIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={feature} />
                              </ListItem>
                            ))}
                            {tierInfo.features.length > 3 && (
                              <ListItem sx={{ py: 0 }}>
                                <ListItemText 
                                  primary={`+${tierInfo.features.length - 3} more features`}
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
                        </Paper>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>

              {/* Feature Access */}
              <Grid item xs={12}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Feature Access
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {Object.entries(subscriptionInfo?.feature_access || {}).map(([feature, hasAccess]) => (
                        <Grid item xs={12} sm={6} md={4} key={feature}>
                          <Box 
                            display="flex" 
                            alignItems="center" 
                            gap={1}
                            sx={{ 
                              p: 1, 
                              borderRadius: 1,
                              backgroundColor: hasAccess ? 'success.50' : 'grey.50'
                            }}
                          >
                            <CheckIcon 
                              color={hasAccess ? 'success' : 'disabled'} 
                              fontSize="small" 
                            />
                            <Typography 
                              variant="body2"
                              color={hasAccess ? 'text.primary' : 'text.secondary'}
                            >
                              {feature.replace('post.', '').replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </AppTheme>

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
            <Button
              icon={<CloseIcon />}
              onClick={() => setUpgradeDialogOpen(false)}
            >
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTier && (
            <Box>
              <Typography variant="h5" color="primary" gutterBottom>
                {getSubscriptionTierInfo(selectedTier).name}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                {getSubscriptionTierInfo(selectedTier).price}/{getSubscriptionTierInfo(selectedTier).period}
              </Typography>
              <Typography variant="body1" paragraph>
                {getSubscriptionTierInfo(selectedTier).description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                New Features You'll Get:
              </Typography>
              <List dense>
                {getSubscriptionTierInfo(selectedTier).features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
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
            startIcon={<PaymentIcon />}
          >
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionManagement;
