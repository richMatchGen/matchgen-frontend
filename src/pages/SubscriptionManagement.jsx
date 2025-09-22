import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircleRounded as CheckIcon,
  AutoAwesome as AutoAwesomeIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon
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
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

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
            subscription_tier: null,
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
          
        console.log('Fetching feature access for club:', clubId);
        console.log('API URL:', `${API_BASE_URL}users/feature-access/?club_id=${clubId}`);
        
        try {
          const response = await axios.get(
            `${API_BASE_URL}users/feature-access/?club_id=${clubId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          console.log('Feature access response:', response.data);
          setSubscriptionInfo(response.data);
        } catch (error) {
          if (error.response?.status === 403) {
            // User doesn't have access to this club, clear the selectedClubId and try to get the correct one
            console.warn('User does not have access to selected club, clearing localStorage and fetching correct club');
            localStorage.removeItem('selectedClubId');
            
            // Try to get the user's actual club
            try {
              const clubResponse = await axios.get(
                `${API_BASE_URL}users/my-club/`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );
              
              if (clubResponse.data && clubResponse.data.id) {
                const correctClubId = clubResponse.data.id.toString();
                localStorage.setItem('selectedClubId', correctClubId);
                
                // Retry with the correct club ID
                const retryResponse = await axios.get(
                  `${API_BASE_URL}users/feature-access/?club_id=${correctClubId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                );
                
                console.log('Feature access response (retry):', retryResponse.data);
                setSubscriptionInfo(retryResponse.data);
                return;
              }
            } catch (clubError) {
              console.warn('Could not fetch user club:', clubError);
            }
          }
          
          // If we get here, something went wrong
          throw error;
        }
      } else {
        // Set default subscription info for users without clubs
        setSubscriptionInfo({
          subscription_tier: null,
          subscription_active: false,
          feature_access: {}
        });
      }
    } catch (error) {
      console.error('Error fetching subscription info:', error);
      
      // Check if it's a 403 error (permission issue)
      if (error.response?.status === 403) {
        console.log('403 error - likely permission issue, using fallback data');
        setError(null); // Don't show error for 403, use fallback
      } else {
        setError('Failed to load subscription information');
      }
      
      // Set default subscription info on error
      setSubscriptionInfo({
        subscription_tier: null,
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
        title: 'Basic Gen',
        price: '9.99',
        description: [
          'Upcoming Fixture Posts',
          'Matchday Posts', 
          'Starting XI Posts',
          '1 Team',
          'Basic Templates'
        ],
        buttonText: 'Choose Basic Gen',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
        color: 'primary'
      },
      semipro: {
        title: 'SemiPro Gen',
        subheader: 'Recommended',
        price: '14.99',
        description: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts',
          '1 Team',
          'Enhanced Templates'
        ],
        buttonText: 'Choose SemiPro Gen',
        buttonVariant: 'contained',
        buttonColor: 'secondary',
        color: 'secondary'
      },
      prem: {
        title: 'Prem Gen',
        price: '24.99',
        description: [
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
        buttonText: 'Choose Prem Gen',
        buttonVariant: 'outlined',
        buttonColor: 'primary',
        color: 'warning'
      }
    };
    return tiers[tier] || tiers.basic;
  };

  // Define tier hierarchy for upgrade/downgrade detection
  const tierHierarchy = {
    'basic': 1,
    'semipro': 2,
    'prem': 3
  };

  const isUpgrade = (currentTier, newTier) => {
    return tierHierarchy[newTier] > tierHierarchy[currentTier];
  };

  const isDowngrade = (currentTier, newTier) => {
    return tierHierarchy[newTier] < tierHierarchy[currentTier];
  };

  const handlePlanChange = (tier) => {
    setSelectedTier(tier);
    setUpgradeDialogOpen(true);
  };

  const confirmPlanChange = async () => {
    if (!selectedTier) return;
    
    try {
      const clubId = localStorage.getItem('selectedClubId');
      const currentTier = subscriptionInfo?.subscription_tier;
      
      if (!currentTier) {
        // No current subscription, use checkout for new subscription
        await stripeService.redirectToCheckout(selectedTier, clubId);
        return;
      }
      
      // Determine if it's an upgrade or downgrade
      if (isUpgrade(currentTier, selectedTier)) {
        // Handle upgrade with immediate proration
        await handleUpgrade(currentTier, selectedTier, clubId);
      } else if (isDowngrade(currentTier, selectedTier)) {
        // Handle downgrade scheduled for next period
        await handleDowngrade(currentTier, selectedTier, clubId);
      } else {
        // Same tier - no action needed
        alert('You are already on this plan.');
        setUpgradeDialogOpen(false);
      }
      
    } catch (error) {
      console.error('Error processing plan change:', error);
      alert('Failed to process plan change. Please try again.');
    }
  };

  const handleUpgrade = async (currentTier, newTier, clubId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://matchgen-backend-production.up.railway.app'}/api/users/stripe/upgrade-subscription/`,
        { 
          club_id: clubId,
          tier: newTier
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        alert('Subscription upgraded successfully! You now have immediate access to the new features.');
        setUpgradeDialogOpen(false);
        // Refresh subscription info
        await fetchSubscriptionInfo();
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  };

  const handleDowngrade = async (currentTier, newTier, clubId) => {
    const confirmed = window.confirm(
      `Your subscription will be downgraded to ${getSubscriptionTierInfo(newTier).title} at the end of your current billing period. ` +
      `You'll continue to have access to your current features until then. Continue?`
    );
    
    if (!confirmed) {
      setUpgradeDialogOpen(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://matchgen-backend-production.up.railway.app'}/api/users/stripe/downgrade-subscription/`,
        { 
          club_id: clubId,
          tier: newTier
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        alert('Subscription downgrade scheduled successfully! The change will take effect at the end of your current billing period.');
        setUpgradeDialogOpen(false);
        // Refresh subscription info
        await fetchSubscriptionInfo();
      }
    } catch (error) {
      console.error('Error scheduling downgrade:', error);
      throw error;
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      const clubId = localStorage.getItem('selectedClubId');
      
      if (!clubId) {
        alert('No club selected. Please select a club first.');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://matchgen-backend-production.up.railway.app'}/api/users/stripe/cancel-subscription/`,
        { club_id: clubId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setCancelSuccess(true);
        setCancelDialogOpen(false);
        // Refresh subscription info
        await fetchSubscriptionInfo();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setCanceling(true);
      const clubId = localStorage.getItem('selectedClubId');
      
      if (!clubId) {
        alert('No club selected. Please select a club first.');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'https://matchgen-backend-production.up.railway.app'}/api/users/stripe/reactivate-subscription/`,
        { club_id: clubId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        setCancelSuccess(false);
        // Refresh subscription info
        await fetchSubscriptionInfo();
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription. Please try again.');
    } finally {
      setCanceling(false);
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

  const currentTier = subscriptionInfo?.subscription_tier;
  const hasActiveSubscription = subscriptionInfo?.subscription_active === true;
  const clubId = localStorage.getItem('selectedClubId');
  
  // Only show current plan if user has an active subscription
  const currentTierInfo = hasActiveSubscription && currentTier ? getSubscriptionTierInfo(currentTier) : null;

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

            {/* Current Plan Section - Only show if user has active subscription */}
            {currentTierInfo && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                  Your Current Plan
                </Typography>
                <Grid container justifyContent="center">
                  <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 4,
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}>
                      <CardContent>
                        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                          <Typography component="h3" variant="h6">{currentTierInfo.title}</Typography>
                          <Chip label="Current Plan" color="primary" />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                          <Typography component="h3" variant="h2">£{currentTierInfo.price}</Typography>
                          <Typography component="h3" variant="h6"> per month</Typography>
                        </Box>
                        <Divider sx={{ my: 2, opacity: 0.8, borderColor: 'divider' }} />
                        {currentTierInfo.description.map((line) => (
                          <Box key={line} sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <CheckIcon sx={{ width: 20, color: 'primary.main' }} />
                            <Typography variant="subtitle2" component="span">{line}</Typography>
                          </Box>
                        ))}
                      </CardContent>
                      <CardActions sx={{ flexDirection: 'column', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<PaymentIcon />}
                          onClick={async () => {
                            try {
                              const clubId = localStorage.getItem('selectedClubId');
                              await stripeService.redirectToBillingPortal(clubId);
                            } catch (error) {
                              console.error('Error redirecting to billing portal:', error);
                              alert('Failed to open billing portal. Please try again.');
                            }
                          }}
                        >
                          Manage Billing
                        </Button>
                        
                        {/* Cancellation Status and Actions */}
                        {subscriptionInfo?.subscription_canceled ? (
                          <Box sx={{ width: '100%', textAlign: 'center' }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                Your subscription is set to cancel at the end of the current billing period.
                              </Typography>
                            </Alert>
                            <Button
                              fullWidth
                              variant="contained"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={handleReactivateSubscription}
                              disabled={canceling}
                            >
                              {canceling ? 'Reactivating...' : 'Reactivate Subscription'}
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => setCancelDialogOpen(true)}
                          >
                            Cancel Subscription
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Available Plans Section */}
            <Box sx={{ width: { sm: '100%', md: '60%' }, textAlign: { sm: 'left', md: 'center' }, mx: 'auto', mb: 4 }}>
              <Typography component="h2" variant="h4" gutterBottom sx={{ color: 'text.primary' }}>
                Choose Your Plan
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Select the subscription plan that best fits your club's needs and start creating amazing content.
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              {['basic', 'semipro', 'prem'].map((tier) => {
                const tierInfo = getSubscriptionTierInfo(tier);
                const isCurrentTier = hasActiveSubscription && tier === currentTier;
                
                return (
                  <Grid item xs={12} sm={tier === 'prem' ? 12 : 6} md={4} key={tier}>
                    <Card sx={{ 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 4, 
                      ...(tier === 'semipro' && { 
                        background: 'radial-gradient(circle at 50% 0%, hsl(220, 20%, 35%), hsl(220, 30%, 6%))' 
                      }),
                      ...(isCurrentTier && {
                        border: '2px solid',
                        borderColor: 'primary.main'
                      })
                    }}>
                      <CardContent>
                        <Box sx={{ 
                          mb: 1, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          gap: 2, 
                          ...(tier === 'semipro' && { color: 'grey.100' }) 
                        }}>
                          <Typography component="h3" variant="h6">{tierInfo.title}</Typography>
                          {tier === 'semipro' && <Chip icon={<AutoAwesomeIcon />} label={tierInfo.subheader} />}
                          {isCurrentTier && <Chip label="Current Plan" color="primary" size="small" />}
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'baseline', 
                          ...(tier === 'semipro' && { color: 'grey.50' }) 
                        }}>
                          <Typography component="h3" variant="h2">£{tierInfo.price}</Typography>
                          <Typography component="h3" variant="h6"> per month</Typography>
                        </Box>
                        <Divider sx={{ my: 2, opacity: 0.8, borderColor: 'divider' }} />
                        {tierInfo.description.map((line) => (
                          <Box key={line} sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <CheckIcon sx={{ 
                              width: 20, 
                              color: tier === 'semipro' ? 'primary.light' : 'primary.main' 
                            }} />
                            <Typography 
                              variant="subtitle2" 
                              component="span" 
                              sx={tier === 'semipro' ? { color: 'grey.50' } : {}}
                            >
                              {line}
                            </Typography>
                          </Box>
                        ))}
                      </CardContent>
                      <CardActions>
                        <Button 
                          fullWidth 
                          variant={tierInfo.buttonVariant} 
                          color={tierInfo.buttonColor}
                          disabled={isCurrentTier}
                          onClick={() => handlePlanChange(tier)}
                        >
                          {isCurrentTier ? 'Current Plan' : tierInfo.buttonText}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>
      </AppTheme>

      {/* Plan Change Dialog */}
      <Dialog 
        open={upgradeDialogOpen} 
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedTier && subscriptionInfo?.subscription_tier ? 
                (isUpgrade(subscriptionInfo.subscription_tier, selectedTier) ? 'Upgrade Subscription' :
                 isDowngrade(subscriptionInfo.subscription_tier, selectedTier) ? 'Downgrade Subscription' :
                 'Change Subscription') : 'Select Plan'}
            </Typography>
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
                {getSubscriptionTierInfo(selectedTier).title}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                £{getSubscriptionTierInfo(selectedTier).price}/month
              </Typography>
              
              {/* Show different messages based on upgrade/downgrade */}
              {subscriptionInfo?.subscription_tier && (
                <>
                  {isUpgrade(subscriptionInfo.subscription_tier, selectedTier) && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Immediate Upgrade:</strong> You'll be charged a prorated amount and get immediate access to new features.
                      </Typography>
                    </Alert>
                  )}
                  
                  {isDowngrade(subscriptionInfo.subscription_tier, selectedTier) && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Scheduled Downgrade:</strong> The change will take effect at the end of your current billing period. You'll keep current features until then.
                      </Typography>
                    </Alert>
                  )}
                </>
              )}
              
              <Typography variant="h6" gutterBottom>
                Features You'll {subscriptionInfo?.subscription_tier && isDowngrade(subscriptionInfo.subscription_tier, selectedTier) ? 'Have After Downgrade:' : 'Get:'}
              </Typography>
              {getSubscriptionTierInfo(selectedTier).description.map((feature, index) => (
                <Box key={index} sx={{ py: 1, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <CheckIcon sx={{ width: 20, color: 'primary.main' }} />
                  <Typography variant="body2">{feature}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmPlanChange}
            startIcon={<PaymentIcon />}
          >
            {selectedTier && subscriptionInfo?.subscription_tier && isDowngrade(subscriptionInfo.subscription_tier, selectedTier) 
              ? 'Schedule Downgrade' 
              : 'Confirm Change'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            <Typography variant="h6">Cancel Subscription</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel your subscription?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your subscription will remain active until the end of your current billing period. 
            You'll continue to have access to all features until then.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              You can reactivate your subscription at any time before the end of your billing period.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            disabled={canceling}
          >
            Keep Subscription
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={handleCancelSubscription}
            disabled={canceling}
            startIcon={canceling ? <CircularProgress size={20} /> : <CancelIcon />}
          >
            {canceling ? 'Canceling...' : 'Cancel Subscription'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      {cancelSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            top: 20, 
            right: 20, 
            zIndex: 9999,
            minWidth: 300
          }}
          onClose={() => setCancelSuccess(false)}
        >
          <Typography variant="body1">
            Subscription canceled successfully. You'll continue to have access until the end of your billing period.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SubscriptionManagement;