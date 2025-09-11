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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider
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
  Business as BusinessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useClubSingleton from '../hooks/useClubSingleton';

const TodoList = () => {
  const navigate = useNavigate();
  const { club } = useClubSingleton();
  const [expanded, setExpanded] = useState(true);
  const [openModal, setOpenModal] = useState(null);
  const [completedTasks, setCompletedTasks] = useState(() => {
    // Load completed tasks from localStorage
    const saved = localStorage.getItem('completedTasks');
    return saved ? JSON.parse(saved) : {};
  });

  // Modal form states
  const [clubForm, setClubForm] = useState({
    name: '',
    sport: '',
    description: ''
  });
  const [fixtureForm, setFixtureForm] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: ''
  });
  const [playerForm, setPlayerForm] = useState({
    name: '',
    position: '',
    number: '',
    age: ''
  });
  const [templateForm, setTemplateForm] = useState({
    selectedPack: '',
    style: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    plan: '',
    billing: 'monthly'
  });

  // Define todo items with their modal content
  const todoItems = [
    {
      id: 'create-club',
      title: 'Create Club',
      description: 'Set up your club profile with name, sport, and branding',
      icon: <BusinessIcon />,
      isCompleted: () => club && club.id,
      severity: 'info'
    },
    {
      id: 'create-fixtures',
      title: 'Create Fixtures',
      description: 'Add your upcoming matches and fixtures',
      icon: <EventIcon />,
      isCompleted: () => completedTasks['create-fixtures'] || false,
      severity: 'warning'
    },
    {
      id: 'create-players',
      title: 'Create Players',
      description: 'Add your team members and player profiles',
      icon: <PersonIcon />,
      isCompleted: () => completedTasks['create-players'] || false,
      severity: 'success'
    },
    {
      id: 'choose-template',
      title: 'Choose Template Pack',
      description: 'Select a graphic template pack for your posts',
      icon: <PaletteIcon />,
      isCompleted: () => completedTasks['choose-template'] || false,
      severity: 'secondary'
    },
    {
      id: 'choose-payment',
      title: 'Choose Payment Plan',
      description: 'Select a subscription plan that fits your needs',
      icon: <PaymentIcon />,
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
    setOpenModal(item.id);
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

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const handleFormSubmit = (formType) => {
    // Here you would typically make API calls to save the data
    console.log(`${formType} form submitted:`, {
      club: clubForm,
      fixture: fixtureForm,
      player: playerForm,
      template: templateForm,
      payment: paymentForm
    }[formType]);
    
    // Mark task as completed
    setCompletedTasks(prev => ({
      ...prev,
      [formType]: true
    }));
    
    handleCloseModal();
  };

  const renderModalContent = () => {
    switch (openModal) {
      case 'create-club':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Your Club
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Club Name"
                value={clubForm.name}
                onChange={(e) => setClubForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Sport</InputLabel>
                <Select
                  value={clubForm.sport}
                  onChange={(e) => setClubForm(prev => ({ ...prev, sport: e.target.value }))}
                >
                  <MenuItem value="football">Football</MenuItem>
                  <MenuItem value="basketball">Basketball</MenuItem>
                  <MenuItem value="tennis">Tennis</MenuItem>
                  <MenuItem value="cricket">Cricket</MenuItem>
                  <MenuItem value="rugby">Rugby</MenuItem>
                  <MenuItem value="hockey">Hockey</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Description"
                value={clubForm.description}
                onChange={(e) => setClubForm(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </Box>
        );

      case 'create-fixtures':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create Fixture
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Home Team"
                value={fixtureForm.homeTeam}
                onChange={(e) => setFixtureForm(prev => ({ ...prev, homeTeam: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Away Team"
                value={fixtureForm.awayTeam}
                onChange={(e) => setFixtureForm(prev => ({ ...prev, awayTeam: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Date"
                type="date"
                value={fixtureForm.date}
                onChange={(e) => setFixtureForm(prev => ({ ...prev, date: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Time"
                type="time"
                value={fixtureForm.time}
                onChange={(e) => setFixtureForm(prev => ({ ...prev, time: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Venue"
                value={fixtureForm.venue}
                onChange={(e) => setFixtureForm(prev => ({ ...prev, venue: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Box>
        );

      case 'create-players':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Player
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Player Name"
                value={playerForm.name}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Position</InputLabel>
                <Select
                  value={playerForm.position}
                  onChange={(e) => setPlayerForm(prev => ({ ...prev, position: e.target.value }))}
                >
                  <MenuItem value="goalkeeper">Goalkeeper</MenuItem>
                  <MenuItem value="defender">Defender</MenuItem>
                  <MenuItem value="midfielder">Midfielder</MenuItem>
                  <MenuItem value="forward">Forward</MenuItem>
                  <MenuItem value="striker">Striker</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Jersey Number"
                type="number"
                value={playerForm.number}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, number: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Age"
                type="number"
                value={playerForm.age}
                onChange={(e) => setPlayerForm(prev => ({ ...prev, age: e.target.value }))}
                fullWidth
              />
            </Stack>
          </Box>
        );

      case 'choose-template':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Template Pack
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth required>
                <InputLabel>Template Pack</InputLabel>
                <Select
                  value={templateForm.selectedPack}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, selectedPack: e.target.value }))}
                >
                  <MenuItem value="classic">Classic Pack</MenuItem>
                  <MenuItem value="modern">Modern Pack</MenuItem>
                  <MenuItem value="vintage">Vintage Pack</MenuItem>
                  <MenuItem value="minimal">Minimal Pack</MenuItem>
                  <MenuItem value="premium">Premium Pack</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Style</InputLabel>
                <Select
                  value={templateForm.style}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, style: e.target.value }))}
                >
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="creative">Creative</MenuItem>
                  <MenuItem value="elegant">Elegant</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="info">
                Preview your selected template pack to see how it will look with your content.
              </Alert>
            </Stack>
          </Box>
        );

      case 'choose-payment':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Payment Plan
            </Typography>
            <Stack spacing={3}>
              <FormControl fullWidth required>
                <InputLabel>Plan</InputLabel>
                <Select
                  value={paymentForm.plan}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, plan: e.target.value }))}
                >
                  <MenuItem value="basic">Basic - $9.99/month</MenuItem>
                  <MenuItem value="pro">Pro - $19.99/month</MenuItem>
                  <MenuItem value="enterprise">Enterprise - $39.99/month</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Billing</InputLabel>
                <Select
                  value={paymentForm.billing}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, billing: e.target.value }))}
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly (20% off)</MenuItem>
                </Select>
              </FormControl>
              <Alert severity="success">
                All plans include unlimited posts, basic templates, and email support.
              </Alert>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  // Don't show the todo list if all tasks are completed
  if (allCompleted) {
    return null;
  }

  return (
    <>
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

      {/* Modal Dialog */}
      <Dialog 
        open={!!openModal} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {openModal && todoItems.find(item => item.id === openModal)?.title}
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {renderModalContent()}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={() => handleFormSubmit(openModal)} 
            variant="contained"
            color="primary"
          >
            Save & Complete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TodoList;