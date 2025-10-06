import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip
} from '@mui/material';
import {
  PhotoLibrary as PhotoIcon,
  SportsSoccer as LogoIcon,
  Description as TemplateIcon,
  Wallpaper as BackgroundIcon
} from '@mui/icons-material';

const MediaManager = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Media Manager
          </Typography>
          <Chip 
            label="Coming Soon" 
            color="primary" 
            variant="outlined"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          border: '2px dashed',
          borderColor: 'grey.300'
        }}>
          <PhotoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold' }}>
            Media Management Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload, organize, and manage all your club's media assets
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<PhotoIcon />}
              label="Photos" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip 
              icon={<LogoIcon />}
              label="Logos" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip 
              icon={<TemplateIcon />}
              label="Templates" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Chip 
              icon={<BackgroundIcon />}
              label="Assets" 
              variant="outlined" 
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MediaManager;