import React from "react";
import {
  Container,
  Box,
  CssBaseline,
} from "@mui/material";
import AppTheme from "../themes/AppTheme";
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import MatchdayPostGenerator from '../components/MatchdayPostGenerator';

const MatchdayPosts = () => {
  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Matchday Posts" />
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <MatchdayPostGenerator />
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default MatchdayPosts;
