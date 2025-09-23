import React, { useState } from 'react';
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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckIcon,
  Star as StarIcon,
  Upgrade as UpgradeIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import useFeatureAccess from '../hooks/useFeatureAccess';

const FeatureGate = ({ 
  featureCode, 
  children, 
  fallback = null,
  showUpgradeDialog = true,
  cardProps = {}
}) => {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const {
    hasAccess,
    loading,
    subscriptionInfo,
    featureInfo,
    currentTierInfo,
    nextTierInfo
  } = useFeatureAccess(featureCode);


  const handleUpgradeClick = () => {
    if (showUpgradeDialog) {
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
      <Card {...cardProps}>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
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
        <DialogTitle sx={{ color: 'white' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: 'white' }}>Upgrade Your Plan</Typography>
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
            {/* Current Plan */}
            {currentTierInfo && (
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }} gutterBottom>
                  Current Plan: {currentTierInfo.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} gutterBottom>
                  {currentTierInfo.price}/{currentTierInfo.period}
                </Typography>
                <List dense>
                  {currentTierInfo.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider />

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
                <Typography variant="h5" sx={{ color: 'white' }} gutterBottom>
                  {nextTierInfo.price}/{nextTierInfo.period}
                </Typography>
                <List dense>
                  {nextTierInfo.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        sx={{ '& .MuiListItemText-primary': { color: 'white' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Feature Highlight */}
            {featureInfo && (
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
                  <strong style={{ color: 'white' }}>{featureInfo.name}</strong>: {featureInfo.description}
                </Typography>
              </Alert>
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
          >
            Upgrade to {nextTierInfo?.name || 'Next Tier'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FeatureGate;
