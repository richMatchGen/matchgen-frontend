
import axios from "axios";
import GraphicPackList from "../components/GraphicPackList";
import { Container, Typography, Alert, Snackbar, Box, CssBaseline } from "@mui/material";
import { alpha } from '@mui/material/styles';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ChoosePackPage() {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleSelect = async (packId) => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        "https://matchgen-backend-production.up.railway.app/api/graphicpack/select-pack/",
        { pack_id: packId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbar({ 
        open: true, 
        message: "Template pack selected successfully!", 
        severity: "success" 
      });
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error("Error selecting pack", err);
      
      // Handle different error scenarios
      if (err.response?.status === 404) {
        setSnackbar({ 
          open: true, 
          message: "Template pack selection endpoint not available. Proceeding to dashboard.", 
          severity: "warning" 
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else if (err.response?.status === 401) {
        setSnackbar({ 
          open: true, 
          message: "Authentication required. Please log in again.", 
          severity: "error" 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: "Failed to select template pack. Please try again.", 
          severity: "error" 
        });
      }
    }
  };

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
          <Container sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Choose a Template Pack
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Select a graphic template pack for your social media posts. If the packs are not loading, 
              sample packs will be shown for demonstration purposes.
            </Typography>
            
            <GraphicPackList onSelect={handleSelect} />
            
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={() => setSnackbar({ open: false, message: "", severity: "info" })}
              message={snackbar.message}
            />
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
}

