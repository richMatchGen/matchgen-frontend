import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Link as RouterLink } from 'react-router-dom';

const PSDProcessorLink = () => {
  return (
    <Button
      component={RouterLink}
      to="/psd-processor"
      variant="outlined"
      size="small"
      startIcon={<CloudUploadIcon />}
      sx={{
        justifyContent: 'flex-start',
        textTransform: 'none',
        borderColor: 'primary.main',
        color: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
        },
      }}
    >
      <Box sx={{ textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          PSD Processor
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Extract layer info
        </Typography>
      </Box>
    </Button>
  );
};

export default PSDProcessorLink;







