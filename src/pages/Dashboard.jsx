import * as React from 'react';
import { useState, useEffect } from "react";
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from '../components/AppNavbar';
import Header from '../components/Header';
import MainGrid from '../components/MainGrid';
import SideMenu from '../components/SideMenu';
import Categories from '../components/Categories';
import AppTheme from '../themes/AppTheme';
import { getProfile } from '../services/auth'; // Ensure this function exists


import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../themes/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};



export default function Dashboard(props) {
  const [user, setUser] = useState(null); // ✅ Declare user state

  useEffect(() => {
    const fetchUser = async () => {
      const userData = getProfile(); // Get user data from auth service
      setUser(userData); // ✅ Set user in state
    };
    fetchUser();
  }, []);


  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box>
        <SideMenu/>
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({

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
            <MainGrid />
            <Categories />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}




