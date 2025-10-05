import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  Chip,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import {
  SportsSoccer as SoccerIcon,
  AutoAwesome as MagicIcon,
  Speed as SpeedIcon,
  Group as TeamIcon,
  Public as SocialIcon,
  Palette as DesignIcon,
  Schedule as ScheduleIcon,
  CloudUpload as UploadIcon,
  PhotoLibrary as MediaIcon,
  TrendingUp as GrowthIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const About = () => {
  const features = [
    {
      icon: <MagicIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Automated Graphics',
      description: 'Generate professional matchday graphics, starting XIs, and fixture updates with just a few clicks.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Save Time',
      description: 'No more creating graphics from scratch. Our templates and automation save hours every week.'
    },
    {
      icon: <TeamIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Built for Clubs',
      description: 'Designed specifically for sports clubs, from semi-professional to amateur and grassroots.'
    },
    {
      icon: <SocialIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Social Media Ready',
      description: 'Perfectly sized graphics for all social media platforms with consistent branding.'
    },
    {
      icon: <DesignIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Professional Look',
      description: 'Maintain a professional online presence with high-quality, branded graphics.'
    },
    {
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Stay Consistent',
      description: 'Never miss a post again with automated scheduling and consistent posting.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Clubs Using MatchGen' },
    { number: '10,000+', label: 'Graphics Generated' },
    { number: '95%', label: 'Time Saved' },
    { number: '24/7', label: 'Support Available' }
  ];

  const team = [
    {
      name: 'Rich',
      role: 'Founder & Developer',
      avatar: '/api/placeholder/150/150',
      bio: 'Volunteer at a local club who experienced the struggles of managing social media for grassroots sports.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                MatchGen was born from the real struggles of grassroots sports.
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                As a volunteer juggling multiple roles at a local club — from helping with junior training to managing the stock levels behind the bar — I found myself also stepping into the role of Social Media Manager, a job that barely existed a generation ago.
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                Keeping up with matchday posts, team line-ups, and graphics became too much. I was missing posts, losing consistency, and wasting time trying to make each one from scratch.
              </Typography>
              <Button
                component={RouterLink}
                to="/feedback"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Get in Touch
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                {/* Mock graphics collage */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                    '& > *': {
                      transform: 'rotate(5deg)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(0deg) scale(1.05)'
                      }
                    }
                  }}
                >
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      bgcolor: 'white',
                      color: 'text.primary',
                      maxWidth: 200,
                      transform: 'rotate(-5deg)'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      MATCHDAY
                    </Typography>
                    <Typography variant="body2">
                      Saturday 3:00 PM
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      bgcolor: 'primary.main',
                      color: 'white',
                      maxWidth: 200,
                      transform: 'rotate(3deg)'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Starting XI
                    </Typography>
                    <Typography variant="body2">
                      vs. Rivals FC
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 2,
                      bgcolor: 'success.main',
                      color: 'white',
                      maxWidth: 200,
                      transform: 'rotate(-2deg)'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      New Signing
                    </Typography>
                    <Typography variant="body2">
                      Welcome John Doe
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Our Mission
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            MatchGen is a social media graphics and marketing tool built specifically for sports clubs — from semi-professional to amateur and grassroots. We create matchday graphics, starting XIs, fixture updates, and more — helping clubs save time, stay consistent, and look professional online.
          </Typography>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <CardContent>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Why Choose MatchGen?
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Everything you need to manage your club's social media presence
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" sx={{ mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Get started in minutes, not hours
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <UploadIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  1. Upload Your Assets
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Upload your club logo, player photos, and other media to your personal media manager.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <DesignIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  2. Choose Templates
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Select from our library of professional templates designed specifically for sports clubs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <MagicIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  3. Generate & Share
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Generate professional graphics instantly and share them across all your social media platforms.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" sx={{ mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Meet the Team
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Built by volunteers, for volunteers
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <CardContent>
                    <Avatar
                      src={member.avatar}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 3 }}
                    />
                    <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {member.name}
                    </Typography>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Transform Your Club's Social Media?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of clubs already using MatchGen to create professional graphics in minutes.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Get Started Free
            </Button>
            <Button
              component={RouterLink}
              to="/feedback"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Contact Us
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;
