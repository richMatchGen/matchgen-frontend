import React from 'react';
import { Card, CardContent, Typography, Box, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const SocialButton = styled(Button)(({ theme, connected }) => ({
  justifyContent: 'flex-start',
  textTransform: 'none',
  padding: '8px 16px',
  backgroundColor: connected ? theme.palette.success.main : theme.palette.grey[100],
  color: connected ? 'white' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: connected ? theme.palette.success.dark : theme.palette.grey[200],
  },
  '& .MuiSvgIcon-root': {
    marginRight: 1,
  }
}));

const SocialMediaConnect = () => {
  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      connected: true,
      color: '#1877F2'
    },
    {
      name: 'Instagram', 
      icon: <InstagramIcon />,
      connected: false,
      color: '#E4405F'
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      connected: false,
      color: '#1DA1F2'
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      connected: false,
      color: '#0077B5'
    }
  ];

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Connect Social Media (Coming Soon)
        </Typography>
        
        <Stack spacing={1}>
          {socialPlatforms.map((platform) => (
            <SocialButton
              key={platform.name}
              variant="contained"
              startIcon={platform.icon}
              connected={platform.connected}
              fullWidth
              onClick={() => {
                if (!platform.connected) {
                  // Handle connection logic
                  console.log(`Connecting to ${platform.name}`);
                }
              }}
            >
              {platform.connected ? 'Connected' : 'Connect'}
            </SocialButton>
          ))}
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

export default SocialMediaConnect;
