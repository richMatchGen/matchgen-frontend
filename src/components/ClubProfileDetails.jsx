import * as React from 'react';
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Stack,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  SportsSoccer as SoccerIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  CalendarToday as FoundedIcon,
  Group as MembersIcon,
  Star as PremiumIcon,
  CheckCircle as VerifiedIcon,
  Refresh as RefreshIcon,
  CalendarToday,
  EmojiEvents
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import useClubSingleton from "../hooks/useClubSingleton";

export default function ClubProfileDetails() {
  console.log('🏢 ClubProfileDetails component rendering');
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { club, loading: clubLoading, error: clubError, refreshClub } = useClubSingleton();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debug logging
  console.log('ClubProfileDetails - club:', club);
  console.log('ClubProfileDetails - clubLoading:', clubLoading);
  console.log('ClubProfileDetails - clubError:', clubError);
  console.log('ClubProfileDetails - loading:', loading);
  console.log('ClubProfileDetails - error:', error);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      console.log('🔄 Manual refresh triggered');
      await refreshClub();
      console.log('🔄 Manual refresh completed');
    } catch (err) {
      console.error('🔄 Manual refresh error:', err);
      setError("Failed to refresh club data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClub = () => {
    if (club?.id) {
      navigate(`/edit-club/${club.id}`);
    }
  };

  // Loading state
  if (clubLoading || loading) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Loading Club Profile...
            </Typography>
          </Stack>
        </Card>
      </Fade>
    );
  }

  // Error state
  if (clubError || error) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={3} alignItems="center" maxWidth={400}>
            <Alert severity="error" sx={{ width: '100%' }}>
              {clubError || error}
            </Alert>
            <Button
              variant="contained"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Try Again'}
            </Button>
          </Stack>
        </Card>
      </Fade>
    );
  }

  // No club state
  if (!club) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={3} alignItems="center" maxWidth={400}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.light,
                color: theme.palette.primary.main
              }}
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="600" textAlign="center">
              No Club Profile
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Create your club profile to get started
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/create-club")}
                startIcon={<BusinessIcon />}
              >
                Create Club Profile
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleRefresh}
                startIcon={<RefreshIcon />}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Fade>
    );
  }

  return (
    <Zoom in={true} timeout={500}>
      <Card sx={{ height: 'auto', minHeight: 400 }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #28443f 0%, #1a2f2a 100%)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}
          />
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              src={club.logo}
              sx={{
                width: 80,
                height: 80,
                border: '3px solid rgba(255,255,255,0.3)',
                bgcolor: 'rgba(255,255,255,0.2)'
              }}
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Typography variant="h4" fontWeight="700" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                  {club.name}
                </Typography>
                {club.verified && (
                  <Tooltip title="Verified Club">
                    <VerifiedIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
                  </Tooltip>
                )}
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Chip
                  icon={<SoccerIcon />}
                  label={club.sport || 'Football'}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />
                {club.subscription_tier && (
                  <Chip
                    icon={<PremiumIcon />}
                    label={`${club.subscription_tier.toUpperCase()} Plan`}
                    sx={{
                      bgcolor: club.subscription_tier === 'prem' ? '#FFD700' : 'rgba(255,255,255,0.2)',
                      color: club.subscription_tier === 'prem' ? '#000000' : '#ffffff',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Profile">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ color: '#ffffff' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditClub}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
              >
                Edit Profile
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Content */}
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#28443f' }}>
                Basic Information
              </Typography>
              <Stack spacing={2}>
                {club.location && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LocationIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {club.location}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                
                {club.founded_year && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FoundedIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Founded
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {club.founded_year}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                
                {club.bio && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {club.bio}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#28443f' }}>
                Contact Information
              </Typography>
              <Stack spacing={2}>
                {club.email && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <EmailIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {club.email}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                
                {club.phone && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {club.phone}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                
                {club.website && (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <WebsiteIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Website
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="500"
                        component="a"
                        href={club.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {club.website}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Grid>

            Statistics
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: '#28443f' }}>
                Club Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    bgcolor: 'rgba(40, 68, 63, 0.05)',
                    border: '1px solid rgba(40, 68, 63, 0.1)'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <MembersIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h4" fontWeight="700" color="primary">
                        {club.member_count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Members
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    bgcolor: 'rgba(40, 68, 63, 0.05)',
                    border: '1px solid rgba(40, 68, 63, 0.1)'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <SoccerIcon sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h4" fontWeight="700" color="primary">
                        {club.team_count || 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Teams
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    bgcolor: 'rgba(40, 68, 63, 0.05)',
                    border: '1px solid rgba(40, 68, 63, 0.1)'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <CalendarToday sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h4" fontWeight="700" color="primary">
                        {club.fixture_count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fixtures
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    bgcolor: 'rgba(40, 68, 63, 0.05)',
                    border: '1px solid rgba(40, 68, 63, 0.1)'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <EmojiEvents sx={{ fontSize: 32, color: theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h4" fontWeight="700" color="primary">
                        {club.trophy_count || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Trophies
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Zoom>
  );
}
