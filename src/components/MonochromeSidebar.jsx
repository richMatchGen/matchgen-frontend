import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SportsSoccer as MatchIcon,
  Group as TeamIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Lock as LockIcon,
  Upgrade as UpgradeIcon
} from '@mui/icons-material';

const MonochromeSidebar = ({ 
  open, 
  onClose, 
  selectedItem,
  onItemClick,
  userPlan = 'basic'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      available: true,
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: <MatchIcon />,
      path: '/matches',
      available: true,
    },
    {
      id: 'posts',
      label: 'Post Generator',
      icon: <MatchIcon />,
      path: '/posts',
      available: true,
    },
    {
      id: 'team',
      label: 'Team Management',
      icon: <TeamIcon />,
      path: '/team',
      available: userPlan !== 'basic',
      requiredPlan: 'SemiPro Gen',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      available: true,
    },
    {
      id: 'account',
      label: 'Account',
      icon: <AccountIcon />,
      path: '/account',
      available: true,
    },
  ];

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#000000',
            fontSize: '1.25rem',
          }}
        >
          MatchGen
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666666',
            mt: 0.5,
            textTransform: 'capitalize',
          }}
        >
          {userPlan} Plan
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                if (item.available) {
                  onItemClick(item.path);
                }
              }}
              disabled={!item.available}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                backgroundColor: selectedItem === item.id ? '#f5f5f5' : 'transparent',
                '&:hover': {
                  backgroundColor: item.available ? '#f5f5f5' : 'transparent',
                },
                '&.Mui-disabled': {
                  opacity: 0.6,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.available 
                    ? (selectedItem === item.id ? '#000000' : '#666666')
                    : '#cccccc',
                  minWidth: 40,
                }}
              >
                {item.available ? item.icon : <LockIcon />}
              </ListItemIcon>
              
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: item.available 
                      ? (selectedItem === item.id ? '#000000' : '#000000')
                      : '#999999',
                    fontWeight: selectedItem === item.id ? 600 : 400,
                    fontSize: '0.875rem',
                  },
                }}
              />
              
              {!item.available && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#999999',
                    fontSize: '0.75rem',
                    ml: 1,
                  }}
                >
                  {item.requiredPlan}
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Upgrade Section */}
      {userPlan === 'basic' && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#fafafa',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <UpgradeIcon sx={{ color: '#666666', mr: 1, fontSize: '1.25rem' }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#000000',
                }}
              >
                Upgrade Plan
              </Typography>
            </Box>
            
            <Typography
              variant="caption"
              sx={{
                color: '#666666',
                display: 'block',
                mb: 2,
              }}
            >
              Unlock advanced features with SemiPro Gen or Prem Gen
            </Typography>
            
            <Button
              variant="contained"
              size="small"
              fullWidth
              sx={{
                backgroundColor: '#000000',
                color: '#ffffff',
                fontWeight: 600,
                py: 1,
                '&:hover': {
                  backgroundColor: '#333333',
                },
              }}
            >
              View Plans
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          boxSizing: 'border-box',
          width: 280,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default MonochromeSidebar;





