import * as React from 'react';
import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SelectContent from './SelectContent';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';
import { getToken } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import { getProfile } from '../hooks/auth';
import useClubSingleton from "../hooks/useClubSingleton";
import Sitemark from '../components/Sitemarkicon'

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

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



  return (

    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
       <Sitemark />
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
        {/* <CardAlert /> */}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={club?.name || "No club"}
          src={club?.logo || "/static/images/avatar/7.jpg"}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto' }}>
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
      {club?.name || "No club"}
      {userProfile?.first_name ? ` — ${userProfile.first_name}` : ""}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {userProfile?.email || ""}
    </Typography>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
