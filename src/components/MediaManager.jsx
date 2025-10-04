import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const MediaManager = () => {
  // Mock data for recent media
  const recentMedia = [
    {
      id: 1,
      type: 'image',
      url: '/api/placeholder/150/150',
      alt: 'Team photo 1',
      uploadedAt: '2 hours ago'
    },
    {
      id: 2,
      type: 'image', 
      url: '/api/placeholder/150/150',
      alt: 'Team photo 2',
      uploadedAt: '5 hours ago'
    },
    {
      id: 3,
      type: 'logo',
      url: '/api/placeholder/150/150',
      alt: 'Opponent logo',
      uploadedAt: '1 day ago'
    },
    {
      id: 4,
      type: 'image',
      url: '/api/placeholder/150/150', 
      alt: 'Match photo',
      uploadedAt: '2 days ago'
    }
  ];

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Media Manager
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recent uploads
        </Typography>
        
        <Grid container spacing={1}>
          {recentMedia.map((media) => (
            <Grid item xs={6} sm={3} key={media.id}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 80,
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'grey.200',
                  }
                }}
              >
                <Avatar
                  src={media.url}
                  alt={media.alt}
                  sx={{ width: '100%', height: '100%', borderRadius: 1 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
            View All Media
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MediaManager;
