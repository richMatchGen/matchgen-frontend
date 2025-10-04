import React from 'react';
import { Card, CardContent, Typography, Box, Calendar } from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ScheduledPosts = () => {
  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Scheduled Posts
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          (Coming Soon)
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: 200,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          border: '2px dashed',
          borderColor: 'grey.300'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CalendarTodayIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Calendar integration coming soon
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ScheduledPosts;
