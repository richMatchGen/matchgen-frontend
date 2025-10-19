import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';

const MonochromeHeader = ({ 
  title = "MatchGen", 
  onMenuClick,
  showMenuButton = true,
  rightActions = null 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        color: '#000000',
        borderBottom: '1px solid #e0e0e0',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar 
        sx={{
          minHeight: '64px !important',
          paddingLeft: { xs: '16px', sm: '24px' },
          paddingRight: { xs: '16px', sm: '24px' },
          justifyContent: 'space-between',
        }}
      >
        {/* Left side - Logo and Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {showMenuButton && (
            <IconButton
              edge="start"
              onClick={onMenuClick}
              sx={{
                mr: 2,
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Right side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {rightActions || (
            <>
              <Button
                color="inherit"
                sx={{
                  color: '#666666',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    color: '#000000',
                  },
                }}
              >
                Account
              </Button>
              
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#333333',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  },
                }}
              >
                Upgrade
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MonochromeHeader;









