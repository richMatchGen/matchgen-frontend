import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Tooltip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Upgrade as UpgradeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

// API Configuration - same as apiClient
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://matchgen-backend-production.up.railway.app/api/'
  : 'http://localhost:8000/api/';

const FeatureGate = ({ 
  featureCode, 
  children, 
  fallback = null,
  showUpgradeDialog = true,
  cardProps = {}
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [featureInfo, setFeatureInfo] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const selectedClubId = localStorage.getItem('selectedClubId');

  useEffect(() => {
    if (selectedClubId) {
      checkFeatureAccess();
    } else {
      // If no club ID, try to fetch it from the API
      fetchClubId();
    }
  }, [selectedClubId, featureCode]);

  const fetchClubId = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Fetching club ID...');
      console.log('Token exists:', !!token);
      
      const response = await axios.get(
        `${API_BASE_URL}users/my-club/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Club response:', response.data);
      if (response.data && response.data.id) {
        localStorage.setItem('selectedClubId', response.data.id.toString());
        console.log('Stored club ID:', response.data.id.toString());
        checkFeatureAccess();
      }
    } catch (error) {
      console.error('Error fetching club ID:', error);
      console.error('Error details:', error.response?.data);
      setLoading(false);
    }
  };

  const checkFeatureAccess = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      console.log('Checking feature access for:', featureCode);
      console.log('Club ID:', selectedClubId);
      console.log('Token exists:', !!token);
      
      const response = await axios.get(
        `${API_BASE_URL}users/feature-access/?club_id=${selectedClubId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Feature access response:', response.data);
      const { feature_access, subscription_tier, subscription_active } = response.data;
      setHasAccess(feature_access[featureCode] || false);
      setSubscriptionInfo({ tier: subscription_tier, active: subscription_active });
      
      // Get feature info for upgrade dialog
      if (!feature_access[featureCode] && showUpgradeDialog) {
        getFeatureInfo();
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      console.error('Error details:', error.response?.data);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const getFeatureInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE_URL}users/features/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const feature = response.data.find(f => f.code === featureCode);
      if (feature) {
        setFeatureInfo(feature);
      }
    } catch (error) {
      console.error('Error fetching feature info:', error);
    }
  };

  const getSubscriptionTierInfo = (tier) => {
    const tiers = {
      basic: {
        name: 'Basic Gen',
        price: '£9.99',
        period: 'month',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts'
        ]
      },
      semipro: {
        name: 'SemiPro Gen',
        price: '£14.99',
        period: 'month',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts'
        ]
      },
      prem: {
        name: 'Prem Gen',
        price: '£24.99',
        period: 'month',
        features: [
          'Upcoming Fixture Posts',
          'Matchday Posts',
          'Starting XI Posts',
          'Substitution Posts',
          'Half Time Posts',
          'Full Time Posts',
          'Goal Posts',
          'Player of the Match Posts',
          'Bespoke Templates',
          'Multiple Teams'
        ]
      }
    };
    return tiers[tier] || tiers.basic;
  };

  const getNextTier = (currentTier) => {
    const tierOrder = ['basic', 'semipro', 'prem'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
  };

  const handleUpgradeClick = () => {
    if (showUpgradeDialog) {
      setUpgradeDialogOpen(true);
    }
  };

  const handleUpgrade = () => {
    // TODO: Implement actual upgrade flow
    console.log('Upgrade to next tier');
    setUpgradeDialogOpen(false);
  };

  if (loading) {
    return (
      <Card {...cardProps}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <Typography>Checking access...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  const currentTierInfo = getSubscriptionTierInfo(subscriptionInfo?.tier);
  const nextTier = getNextTier(subscriptionInfo?.tier);
  const nextTierInfo = nextTier ? getSubscriptionTierInfo(nextTier) : null;

  return (
    <>
      <Card 
        {...cardProps}
        sx={{
          ...cardProps.sx,
          opacity: 0.6,
          position: 'relative',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
            boxShadow: 2
          }
        }}
        onClick={handleUpgradeClick}
      >
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <LockIcon color="action" sx={{ fontSize: 48 }} />
            <Typography variant="h6" color="text.secondary" textAlign="center">
              Feature Locked
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {featureInfo?.name || 'This feature'} is not available in your current plan
            </Typography>
            <Button
              variant="contained"
              startIcon={<UpgradeIcon />}
              onClick={(e) => {
                e.stopPropagation();
                handleUpgradeClick();
              }}
            >
              Upgrade to Access
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog 
        open={upgradeDialogOpen} 
        onClose={() => setUpgradeDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Upgrade Your Plan</Typography>
            <Button
              icon={<CloseIcon />}
              onClick={() => setUpgradeDialogOpen(false)}
            >
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Current Plan */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Current Plan: {currentTierInfo.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentTierInfo.price}/{currentTierInfo.period}
              </Typography>
              <List dense>
                {currentTierInfo.features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* Next Tier */}
            {nextTierInfo && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography variant="h6">
                    Recommended: {nextTierInfo.name}
                  </Typography>
                  <Chip 
                    icon={<StarIcon />} 
                    label="Popular" 
                    color="primary" 
                    size="small" 
                  />
                </Box>
                <Typography variant="h5" color="primary" gutterBottom>
                  {nextTierInfo.price}/{nextTierInfo.period}
                </Typography>
                <List dense>
                  {nextTierInfo.features.map((feature, index) => (
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

            {/* Feature Highlight */}
            {featureInfo && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>{featureInfo.name}</strong>: {featureInfo.description}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpgradeDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpgrade}
            disabled={!nextTierInfo}
          >
            Upgrade to {nextTierInfo?.name || 'Next Tier'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeatureGate;
