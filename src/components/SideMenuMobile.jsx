import * as React from 'react';
import { useState, useEffect } from "react";
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import MenuButton from './MenuButton';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { getToken } from "../hooks/auth";
import { getProfile } from '../hooks/auth';
import useClubSingleton from "../hooks/useClubSingleton";
import useAuth from '../hooks/useAuth';
import Sitemark from '../components/Sitemarkicon'
import PropTypes from 'prop-types';

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

export default function SideMenuMobile({ open, toggleDrawer }) {
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const { club, loading, error: clubError, rateLimited } = useClubSingleton();
  const { logout } = useAuth();
  
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
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={club?.name || "No club"}
              src={club?.logo || "/static/images/avatar/7.jpg"}
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
            {club?.name || "No club"}
            </Typography>
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        {/* CardAlert hidden */}
        {/* <CardAlert /> */}
        <Stack sx={{ p: 2 }}>
          {/* <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<LogoutRoundedIcon />}
            onClick={logout}
            sx={{ color: '#d32f2f', borderColor: '#d32f2f', '&:hover': { backgroundColor: '#ffebee' } }}
          >
            Logout
          </Button> */}
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};
