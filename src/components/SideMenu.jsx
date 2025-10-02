import * as React from 'react';
import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';
import { getToken } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import { getProfile } from '../hooks/auth';
import useClubSingleton from "../hooks/useClubSingleton";
import Sitemark from '../components/Sitemarkicon';
import {
  Settings as SettingsIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const drawerWidth = 280;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e0e0e0',
  },
});

const BrandSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e0e0e0',
}));

const UserSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  color: '#333',
  borderTop: '1px solid #e0e0e0',
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: '#666666',
  '&:hover': {
    backgroundColor: '#f5f5f5',
    color: '#000000',
  },
}));

export default function SideMenu({ user }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const { club, loading, error: clubError, rateLimited } = useClubSingleton();
  
  const token = getToken();

  useEffect(() => {
    const fetchUser = async () => {
      const profileData = await getProfile();
      setUserProfile(profileData);
    };

    fetchUser();
  }, []);

  const getSubscriptionColor = (tier) => {
    switch (tier) {
      case 'prem':
        return '#ffd700';
      case 'semipro':
        return '#c0c0c0';
      default:
        return '#cd7f32';
    }
  };

  const getSubscriptionLabel = (tier) => {
    switch (tier) {
      case 'prem':
        return 'Prem Gen';
      case 'semipro':
        return 'SemiPro Gen';
      default:
        return 'Basic Gen';
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'transparent',
        },
      }}
    >
      {/* Brand Section */}
      <BrandSection>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Sitemark />
        </Box>
        {/* {club && (
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontWeight: 500,
                mb: 1 
              }}
            >
              {club.name}
            </Typography>
            <Chip
              label={getSubscriptionLabel(club.subscription_tier)}
              size="small"
              sx={{
                backgroundColor: getSubscriptionColor(club.subscription_tier),
                color: '#000',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 20,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>
        )} */}
      </BrandSection>

      {/* Menu Content */}
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          py: 1,
        }}
      >
        <MenuContent />
      </Box>

      {/* User Section */}
      <UserSection>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            sizes="small"
            alt={club?.name || "No club"}
            src={club?.logo || "/static/images/avatar/7.jpg"}
            sx={{ 
              width: 40, 
              height: 40,
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 500,
                fontSize: '0.875rem',
                lineHeight: 1.2,
              }}
              noWrap
            >
              {userProfile?.first_name} {userProfile?.last_name}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(41, 41, 41, 0.6)',
                fontSize: '0.75rem',
              }}
              noWrap
            >
              {userProfile?.email}
            </Typography>
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Tooltip title="Settings">
            <ActionButton 
              size="small"
              onClick={() => navigate('/settings')}
            >
              <SettingsIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="Profile">
            <ActionButton 
              size="small"
              onClick={() => navigate('/profile')}
            >
              <PersonIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <ActionButton size="small">
              <NotificationsIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="Help">
            <ActionButton size="small">
              <HelpIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
        </Stack>
      </UserSection>
    </Drawer>
  );
}
