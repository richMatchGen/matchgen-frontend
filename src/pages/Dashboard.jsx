import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import useClubSingleton from "../hooks/useClubSingleton";
import apiClient from "../api/config";
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ForgotPassword from '../components/forgotpassword';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import MainGrid from "../components/MainGrid";
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import ColorModeSelect from '../themes/colormodeselect';
import { GoogleIcon, FacebookIcon, SitemarkIcon } from '../components/CustomIcons';
import Overview from "./profile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { club } = useClubSingleton(); // Use singleton hook for club data

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {

      navigate("/login");
      return;
    }
  
    const headers = { Authorization: `Bearer ${token}` };
  
    const fetchData = async () => {
      try {
        console.log('🔍 Dashboard: Starting user data fetch...');
        const userRes = await apiClient.get("/users/me/");
        console.log('🔍 Dashboard user data response:', userRes);
        console.log('🔍 Dashboard user data:', userRes.data);
        console.log('🔍 Dashboard email_verified:', userRes.data?.email_verified);
        setUser(userRes.data);
      } catch (error) {
        console.error('🔍 Dashboard user fetch error:', error);
        console.error('🔍 Dashboard error response:', error.response);
        logout();
        return;
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [navigate]); // ✅ no infinite loop

  if (loading) return <p>Loading your dashboard...</p>;
  if (!user) return null; // user fetch failure already handled

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
          })}
        >
              <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {/* Only show email verification banner if user is not verified */}
            {(() => {
              console.log('🔍 Email verification check:', {
                user: user,
                email_verified: user?.email_verified,
                shouldShowBanner: !user?.email_verified
              });
              return !user?.email_verified;
            })() && (
              <EmailVerificationBanner 
                user={user} 
                onVerificationComplete={() => {
                  // Refresh user data after verification
                  const fetchData = async () => {
                    try {
                      const userRes = await apiClient.get("/users/me/");
                      console.log('🔍 Dashboard user data after verification:', userRes.data);
                      setUser(userRes.data);
                    } catch (error) {
                      console.error('Error refreshing user data:', error);
                    }
                  };
                  fetchData();
                }}
              />
            )}
            <MainGrid />

          </Stack>
    {/* <div>
      <h1>Welcome to your Dashboard 👋</h1>

      <h2>User Info</h2>
      <p><strong>Email:</strong> {user.email}</p>
      {user.profile_picture && <img src={user.profile_picture} alt="Profile" width={100} />}

      <h2>Club Info</h2>
      {club ? (
        <>
          <p><strong>Club Name:</strong> {club.name}</p>
          <p><strong>Sport:</strong> {club.sport}</p>
          {club.logo && <img src={club.logo} alt="Club Logo" width={100} />}
          <button onClick={() => navigate(`/edit-club/${club.id}`)}>Edit Club</button>
        </>
      ) : (
        <p>No club found. <button onClick={() => navigate("/create-club")}>Create one</button></p>
      )}

      <br />
      {/* <button onClick={logout}>Logout</button> */}
    {/* </div> */}


    </Box>
    </Box>
    </AppTheme>
  );
};

export default Dashboard;
