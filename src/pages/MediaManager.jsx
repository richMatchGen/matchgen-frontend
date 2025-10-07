import React from 'react';
import {
  Box,
  Typography,
  Chip,
  CssBaseline,
  Stack
} from '@mui/material';
import {
  PhotoLibrary as PhotoIcon,
  SportsSoccer as LogoIcon,
  Description as TemplateIcon,
  Wallpaper as BackgroundIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';

const MediaManager = () => {
  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: { xs: 12, md: 0 }, // Clear AppNavBar on mobile
          })}
        >
          <Box sx={{ width: '100%', maxWidth: '100%', p: 3 }}>
            <Stack spacing={4} sx={{ width: '100%' }}>
              <Header />
              
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  Media Manager
                </Typography>
                <Chip 
                  label="Coming Soon" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              {/* Coming Soon Content */}
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <PhotoIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Media Manager Coming Soon
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
                  We're working on a powerful media management system that will allow you to upload, organize, and manage all your club's media assets in one place.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<PhotoIcon />}
                    label="Photo Management" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    icon={<LogoIcon />}
                    label="Logo Organization" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    icon={<TemplateIcon />}
                    label="Template Library" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Chip 
                    icon={<BackgroundIcon />}
                    label="Background Assets" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default MediaManager;