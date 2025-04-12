import * as React from 'react';
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';
import { getToken } from "../hooks/auth";
import { useNavigate } from "react-router-dom";
import { getProfile } from '../hooks/auth'; // Ensure this function exists
import useClub from "../hooks/useClub";
import Sitemark from '../components/Sitemarkicon'
import axios from 'axios';


function SideMenuMobile({ open, toggleDrawer }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [userProfile, setUserProfile] = useState(null); // ✅ Declare userProfile state
  const [club, setClub] = useState(null);
  
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };



    useEffect(() => {
    const fetchUser = async () => {
      const profileData  = await getProfile();

      setUserProfile(profileData);
      
    };

    const fetchClub = async () => {
      try {
        const clubRes = await axios.get(
          "https://matchgen-backend-production.up.railway.app/api/users/my-club/",
          { headers }
        );
        setClub(clubRes.data);
      } catch (err) {
        console.warn("User might not have a club yet.");
        console.error("Actual error:", err); // 👈 ADD THIS
        setClub(null);
      } finally {
        setLoading(false);
      }
    };


    fetchClub();
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
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button variant="outlined" fullWidth startIcon={<LogoutRoundedIcon />}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
