import React, { useState, useEffect } from 'react';
import {
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
  CircularProgress,
  Button
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Upgrade as UpgradeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';

import env from '../config/environment';
// API Configuration
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '${env.API_BASE_URL}/'
  : 'http://localhost:8000/api/';

const FeatureRestrictedElement = ({ 
  featureCode,
  children,
  fallback = null,
  showUpgradeDialog = true,
  tooltipText = "Upgrade to access this feature",
  upgradeDialogTitle = "Upgrade Required",
  upgradeDialogDescription = "This feature requires a higher subscription tier.",
  overlayStyle = {},
  disabledStyle = {
    opacity: 0.6,
    filter: 'grayscale(0.3)',
    pointerEvents: 'none'
  },
  ...props
}) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [featureInfo, setFeatureInfo] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const selectedClubId = localStorage.getItem('selectedClubId');

  useEffect(() => {
    if (selectedClubId && featureCode) {
      checkFeatureAccess();
    } else {
      setLoading(false);
    }
  }, [selectedClubId, featureCode]);

  const checkFeatureAccess = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (selectedClubId && selectedClubId !== 'null') {
        try {
          const response = await axios.get(
            `${API_BASE_URL}users/feature-access/?club_id=${selectedClubId}&t=${Date.now()}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const { feature_access, subscription_tier, subscription_active } = response.data;
          setHasAccess(feature_access[featureCode] || false);
          setSubscriptionInfo({ tier: subscription_tier, active: subscription_active });
          
          // Get feature info for upgrade dialog
          if (!feature_access[featureCode] && showUpgradeDialog) {
            getFeatureInfo();
          }
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
                  `${API_BASE_URL}users/feature-access/?club_id=${correctClubId}&t=${Date.now()}`,
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                );
                
                const { feature_access, subscription_tier, subscription_active } = retryResponse.data;
                setHasAccess(feature_access[featureCode] || false);
                setSubscriptionInfo({ tier: subscription_tier, active: subscription_active });
                
                if (!feature_access[featureCode] && showUpgradeDialog) {
                  getFeatureInfo();
                }
                return;
              }
            } catch (clubError) {
              console.warn('Could not fetch user club:', clubError);
            }
          }
          
          // If we get here, something went wrong
          console.error('Error checking feature access:', error);
          setHasAccess(false);
          setSubscriptionInfo({ tier: 'basic', active: false });
        }
      } else {
        setHasAccess(false);
        setSubscriptionInfo({ tier: 'basic', active: false });
      }
    } catch (error) {
      console.error('Error checking feature access:', error);
      setHasAccess(false);
      setSubscriptionInfo({ tier: 'basic', active: false });
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

  const handleClick = () => {
    if (!hasAccess && showUpgradeDialog) {
      setUpgradeDialogOpen(true);
    }
  };

  const handleUpgrade = () => {
    // Redirect to subscription management page
    window.location.href = '/subscription';
    setUpgradeDialogOpen(false);
  };

  if (loading) {
    return (
      <Box
        {...props}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100px',
          ...props.sx
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  const isRestricted = !hasAccess;
  const currentTierInfo = getSubscriptionTierInfo(subscriptionInfo?.tier);
  const nextTier = getNextTier(subscriptionInfo?.tier);
  const nextTierInfo = nextTier ? getSubscriptionTierInfo(nextTier) : null;

  const restrictedElement = (
    <Box
      {...props}
      sx={{
        ...props.sx,
        ...(isRestricted && disabledStyle),
        position: 'relative',
        cursor: isRestricted ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >
      {children}
      
      {/* Lock Overlay */}
      {isRestricted && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            zIndex: 1,
            ...overlayStyle
          }}
        >
          <LockIcon 
            color="action" 
            sx={{ 
              fontSize: 32, 
              mb: 1,
              opacity: 0.7
            }} 
          />
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ 
              textAlign: 'center',
              fontWeight: 'medium'
            }}
          >
            Upgrade Required
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isRestricted) {
    return (
      <>
        <Tooltip title={tooltipText} arrow>
          {restrictedElement}
        </Tooltip>

        {/* Upgrade Dialog */}
        <Dialog 
          open={upgradeDialogOpen} 
          onClose={() => setUpgradeDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ color: 'white' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ color: 'white' }}>{upgradeDialogTitle}</Typography>
              <Button
                icon={<CloseIcon />}
                onClick={() => setUpgradeDialogOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ color: 'white' }}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Feature Description */}
              <Alert 
                severity="info"
                sx={{
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  border: '1px solid rgba(33, 150, 243, 0.3)',
                  '& .MuiAlert-message': {
                    color: 'white'
                  }
                }}
              >
                <Typography variant="body2" sx={{ color: 'white' }}>
                  <strong>{featureInfo?.name || 'This feature'}</strong>: {featureInfo?.description || upgradeDialogDescription}
                </Typography>
              </Alert>

              {/* Current Plan */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Current Plan: {currentTierInfo.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', gutterBottom: true }}>
                  {currentTierInfo.price}/{currentTierInfo.period}
                </Typography>
                <List dense>
                  {currentTierInfo.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText primary={feature} sx={{ color: 'white' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              {/* Next Tier */}
              {nextTierInfo && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      Recommended: {nextTierInfo.name}
                    </Typography>
                    <Chip 
                      icon={<StarIcon />} 
                      label="Popular" 
                      color="primary" 
                      size="small" 
                    />
                  </Box>
                  <Typography variant="h5" sx={{ color: '#2196f3', gutterBottom: true }}>
                    {nextTierInfo.price}/{nextTierInfo.period}
                  </Typography>
                  <List dense>
                    {nextTierInfo.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={feature} sx={{ color: 'white' }} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setUpgradeDialogOpen(false)}
              sx={{ color: 'white' }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleUpgrade}
              disabled={!nextTierInfo}
              startIcon={<UpgradeIcon />}
            >
              Upgrade to {nextTierInfo?.name || 'Next Tier'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  return children;
};

export default FeatureRestrictedElement;


