import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Chip,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  SportsSoccer as SportsSoccerIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useClubSingleton from '../hooks/useClubSingleton';
import axios from 'axios';

const TodoList = () => {
  const navigate = useNavigate();
  const { club } = useClubSingleton();
  const [expanded, setExpanded] = useState(true);
  const [completedTasks, setCompletedTasks] = useState(() => {
    // Load completed tasks from localStorage
    const saved = localStorage.getItem('completedTasks');
    return saved ? JSON.parse(saved) : {};
  });
  
  // State for dynamic data
  const [playersCount, setPlayersCount] = useState(0);
  const [fixturesCount, setFixturesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get selected pack from existing club data (avoid rate limiting)
  const selectedPackId = club?.selected_pack;

  // Fetch dynamic data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch players count
        try {
          const playersRes = await axios.get(
            'https://matchgen-backend-production.up.railway.app/api/content/players/',
            { headers }
          );
          setPlayersCount(playersRes.data.results?.length || 0);
        } catch (error) {
          console.warn('Failed to fetch players:', error);
        }

        // Fetch fixtures count
        try {
          const fixturesRes = await axios.get(
            'https://matchgen-backend-production.up.railway.app/api/content/matches/',
            { headers }
          );
          setFixturesCount(fixturesRes.data.results?.length || 0);
        } catch (error) {
          console.warn('Failed to fetch fixtures:', error);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define todo items with their routes and completion logic
  const todoItems = [
    {
      id: 'create-club',
      title: 'Create Club',
      description: 'Set up your club profile with name, sport, and branding',
      icon: <BusinessIcon />,
      route: '/club',
      isCompleted: () => club && club.id,
      severity: 'info'
    },
    {
      id: 'create-fixtures',
      title: 'Create Fixtures',
      description: 'Add your first upcoming fixtures',
      icon: <EventIcon />,
      route: '/fixture/creatematch',
      isCompleted: () => fixturesCount > 0,
      severity: 'warning'
    },
    {
      id: 'create-players',
      title: 'Create Players',
      description: 'Create your first player profile',
      icon: <PersonIcon />,
      route: '/squad/createplayer',
      isCompleted: () => playersCount > 0,
      severity: 'success'
    },
    {
      id: 'choose-template',
      title: 'Choose Template Pack',
      description: 'Select a graphic template pack for your posts',
      icon: <PaletteIcon />,
      route: '/gen/templates',
      isCompleted: () => {
        // More robust template pack completion check
        const completed = selectedPackId != null && 
                        selectedPackId !== '' && 
                        selectedPackId !== undefined &&
                        selectedPackId !== 'null' &&
                        selectedPackId !== 'undefined';
        console.log('🔍 Template pack completion check:', {
          selectedPackId,
          completed,
          type: typeof selectedPackId,
          club: club
        });
        return completed;
      },
      severity: 'secondary'
    }
  ];

  // Check if all tasks are completed with more robust logic
  const allCompleted = todoItems.every(item => {
    try {
      return item.isCompleted();
    } catch (error) {
      console.warn(`Error checking completion for ${item.id}:`, error);
      return false;
    }
  });
  
  // Debug logging for completion status
  useEffect(() => {
    console.log('🔍 TodoList completion status:', {
      allCompleted,
      club: club,
      selectedPackId: selectedPackId,
      playersCount,
      fixturesCount,
      tasks: todoItems.map(item => ({
        id: item.id,
        title: item.title,
        completed: item.isCompleted()
      }))
    });
  }, [allCompleted, selectedPackId, playersCount, fixturesCount, club]);

  // Save completed tasks to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [completedTasks]);

  const handleTaskClick = (item) => {
    navigate(item.route);
  };

  const handleTaskComplete = (taskId, event) => {
    event.stopPropagation();
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Don't show the todo list if all tasks are completed or while loading
  if (allCompleted) {
    console.log('✅ All tasks completed, hiding TodoList');
    return null;
  }

  // Show loading state while fetching data
  if (loading) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        mb: 3, 
        border: '1px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <CardContent>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SportsSoccerIcon color="primary" />
            <Typography variant="h6" component="h2" color="primary">
              Getting Started
            </Typography>
            <Chip 
              label={`${todoItems.filter(item => item.isCompleted()).length}/${todoItems.length} completed`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <IconButton onClick={handleExpandClick} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Stack spacing={2}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Welcome to MatchGen! 🎉</AlertTitle>
              Complete these steps to set up your club and start creating amazing content.
            </Alert>

            <Grid container spacing={2}>
              {todoItems.map((item) => {
                const isCompleted = item.isCompleted();
                return (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <Alert
                      severity={isCompleted ? 'success' : item.severity}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3
                        },
                        opacity: isCompleted ? 0.8 : 1,
                        position: 'relative',
                        // Green background for completed tasks
                        ...(isCompleted && {
                          backgroundColor: 'success.light',
                          color: 'success.contrastText',
                          '& .MuiAlert-icon': {
                            color: 'success.contrastText'
                          }
                        })
                      }}
                      onClick={() => handleTaskClick(item)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                          {item.icon}
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                fontWeight: 600
                              }}
                            >
                              {item.title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              {item.description}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleTaskComplete(item.id, e)}
                          sx={{ 
                            color: isCompleted ? 'success.main' : 'action.disabled',
                            '&:hover': {
                              color: 'success.main'
                            }
                          }}
                        >
                          {isCompleted ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        </IconButton>
                      </Box>
                    </Alert>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setExpanded(false)}
                size="small"
              >
                Hide Getting Started
              </Button>
            </Box>
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TodoList;