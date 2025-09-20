import React from 'react';
import {
  Alert,
  Box,
  Button,
  Typography,
  IconButton,
  Collapse
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SubscriptionBanner = ({ user, club, onSubscriptionComplete }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const navigate = useNavigate();

  // Don't show banner if user has a subscription
  if (club?.subscription_tier && club?.subscription_active) {
    return null;
  }

  // Don't show if dismissed
  if (dismissed) {
    return null;
  }

  const handleChoosePlan = () => {
    navigate('/subscription');
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Alert 
        severity="warning" 
        sx={{ 
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<CreditCardIcon />}
              onClick={handleChoosePlan}
              sx={{ 
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              Choose Plan
            </Button>
            <IconButton
              size="small"
              onClick={handleToggleExpanded}
              sx={{ color: 'text.secondary' }}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleDismiss}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        }
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            🚀 Choose Your Subscription Plan
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            You need to select a subscription plan to access MatchGen features and start creating amazing content for your club.
          </Typography>
          
          <Collapse in={expanded}>
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                What you'll get with a subscription:
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Create professional matchday posts
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Generate starting XI graphics
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Access to premium templates
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Team management features
                </Typography>
                <Typography component="li" variant="body2">
                  Priority support
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Alert>
    </Box>
  );
};

export default SubscriptionBanner;
