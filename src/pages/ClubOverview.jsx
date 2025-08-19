import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useClubSingleton from "../hooks/useClubSingleton";
import useAuth from "../hooks/useAuth";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Avatar,
  Divider,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  SportsSoccer as SportsIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Web as WebIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const ClubOverview = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { club, loading, error } = useClubSingleton(); // Use singleton hook

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleCreateClub = () => {
    navigate("/clubs/createclub");
  };

  const handleEditClub = () => {
    navigate(`/edit-club/${club.id}`);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Club Management
      </Typography>

      {!club ? (
        // No club exists - show create club option
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <SportsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.8 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            No Club Found
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            You haven't created a club yet. Create your first club to get started
            with managing your team, fixtures, and results.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateClub}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                border: "2px solid rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            Create Your First Club
          </Button>
        </Paper>
      ) : (
        // Club exists - show club information
        <Grid container spacing={3}>
          {/* Club Header Card */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box display="flex" justifyContent="center">
                      {club.logo ? (
                        <Avatar
                          src={club.logo}
                          alt={`${club.name} logo`}
                          sx={{ width: 120, height: 120 }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: "primary.main",
                            fontSize: "3rem",
                          }}
                        >
                          {club.name?.charAt(0)?.toUpperCase() || "C"}
                        </Avatar>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h4" component="h2" gutterBottom>
                      {club.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        icon={<SportsIcon />}
                        label={club.sport || "Football"}
                        color="primary"
                        variant="outlined"
                      />
                      {club.location && (
                        <Chip
                          icon={<LocationIcon />}
                          label={club.location}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    {club.description && (
                      <Typography variant="body1" color="text.secondary">
                        {club.description}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleEditClub}
                        fullWidth
                      >
                        Edit Club
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PeopleIcon />}
                        onClick={() => navigate("/squad/createplayer")}
                        fullWidth
                      >
                        Manage Squad
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Club Details */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Club Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  {club.founded_year && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Founded
                      </Typography>
                      <Typography variant="body1">
                        {club.founded_year}
                      </Typography>
                    </Box>
                  )}
                  {club.website && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Website
                      </Typography>
                      <Typography
                        variant="body1"
                        component="a"
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: "primary.main", textDecoration: "none" }}
                      >
                        {club.website}
                      </Typography>
                    </Box>
                  )}
                  {club.email && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Contact Email
                      </Typography>
                      <Typography
                        variant="body1"
                        component="a"
                        href={`mailto:${club.email}`}
                        sx={{ color: "primary.main", textDecoration: "none" }}
                      >
                        {club.email}
                      </Typography>
                    </Box>
                  )}
                  {club.phone && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography
                        variant="body1"
                        component="a"
                        href={`tel:${club.phone}`}
                        sx={{ color: "primary.main", textDecoration: "none" }}
                      >
                        {club.phone}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/fixture/creatematch")}
                      sx={{ height: 80, flexDirection: "column" }}
                    >
                      <AddIcon sx={{ mb: 1 }} />
                      <Typography variant="body2">Create Fixture</Typography>
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/squad/createplayer")}
                      sx={{ height: 80, flexDirection: "column" }}
                    >
                      <PeopleIcon sx={{ mb: 1 }} />
                      <Typography variant="body2">Add Player</Typography>
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/fixtures")}
                      sx={{ height: 80, flexDirection: "column" }}
                    >
                      <SportsIcon sx={{ mb: 1 }} />
                      <Typography variant="body2">View Fixtures</Typography>
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/results")}
                      sx={{ height: 80, flexDirection: "column" }}
                    >
                      <SportsIcon sx={{ mb: 1 }} />
                      <Typography variant="body2">View Results</Typography>
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ClubOverview;
