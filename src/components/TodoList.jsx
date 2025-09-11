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

const TodoList = () => {
  const navigate = useNavigate();
  const { club } = useClubSingleton();
  const [expanded, setExpanded] = useState(true);
  const [completedTasks, setCompletedTasks] = useState(() => {
    // Load completed tasks from localStorage
    const saved = localStorage.getItem('completedTasks');
    return saved ? JSON.parse(saved) : {};
  });

  // Define todo items with their routes and completion logic
  const todoItems = [
    {
      id: 'create-club',
      title: 'Create Club',
      description: 'Set up your club profile with name, sport, and branding',
      icon: <BusinessIcon />,
      route: '/clubs/createclub',
      isCompleted: () => club && club.id,
      severity: 'info'
    },
    {
      id: 'create-fixtures',
      title: 'Create Fixtures',
      description: 'Add your upcoming matches and fixtures',
      icon: <EventIcon />,
      route: '/fixture/creatematch',
      isCompleted: () => completedTasks['create-fixtures'] || false,
      severity: 'warning'
    },
    {
      id: 'create-players',
      title: 'Create Players',
      description: 'Add your team members and player profiles',
      icon: <PersonIcon />,
      route: '/squad/createplayer',
      isCompleted: () => completedTasks['create-players'] || false,
      severity: 'success'
    },
    {
      id: 'choose-template',
      title: 'Choose Template Pack',
      description: 'Select a graphic template pack for your posts',
      icon: <PaletteIcon />,
      route: '/gen/templates',
      isCompleted: () => completedTasks['choose-template'] || false,
      severity: 'secondary'
    },
    {
      id: 'choose-payment',
      title: 'Choose Payment Plan',
      description: 'Select a subscription plan that fits your needs',
      icon: <PaymentIcon />,
      route: '/subscription',
      isCompleted: () => completedTasks['choose-payment'] || false,
      severity: 'error'
    }
  ];

  // Check if all tasks are completed
  const allCompleted = todoItems.every(item => item.isCompleted());

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

  // Don't show the todo list if all tasks are completed
  if (allCompleted) {
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
                        position: 'relative'
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