import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from "@mui/material";
import {
  SportsSoccer as SoccerIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "../hooks/auth";
import { generateStartingXIGraphic, getSquad } from "../hooks/club";

// Utility functions
function not(a, b) {
  return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
  return a.filter((value) => b.includes(value));
}

// Enhanced Starting XI Component
export default function StartingXISelection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [checked, setChecked] = useState([]);
  const [squad, setSquad] = useState([]);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const token = getToken();

  // Enhanced data fetching
  const fetchSquad = useCallback(async () => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await getSquad(token);
      let squadData = [];
      
      // Handle different response structures
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          squadData = response.data;
        } else if (response.data.players && Array.isArray(response.data.players)) {
          squadData = response.data.players;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          squadData = response.data.results;
        } else if (typeof response.data === 'object' && response.data.name) {
          squadData = [response.data];
        }
      }

      // Transform data to include all necessary fields
      const transformedSquad = squadData.map((player, index) => ({
        id: player.id || index + 1,
        name: player.name || 'Unknown Player',
        position: player.position || 'Unknown',
        squad_no: player.squad_no || null,
        sponsor: player.sponsor || null,
        player_pic: player.player_pic || null,
        ...player
      }));

      setSquad(transformedSquad);
      setAvailablePlayers(transformedSquad);
      
      // If no data from API, show sample data
      if (transformedSquad.length === 0) {
        const sampleData = [
          { id: 1, name: 'John Smith', position: 'Forward', squad_no: 10, sponsor: 'Nike' },
          { id: 2, name: 'Mike Johnson', position: 'Midfielder', squad_no: 8, sponsor: 'Adidas' },
          { id: 3, name: 'David Wilson', position: 'Defender', squad_no: 4, sponsor: 'Puma' },
          { id: 4, name: 'Tom Brown', position: 'Goalkeeper', squad_no: 1, sponsor: 'Under Armour' },
          { id: 5, name: 'Alex Davis', position: 'Forward', squad_no: 9, sponsor: 'Nike' },
          { id: 6, name: 'Sam Miller', position: 'Midfielder', squad_no: 6, sponsor: 'Adidas' },
          { id: 7, name: 'Chris Taylor', position: 'Defender', squad_no: 2, sponsor: 'Puma' },
          { id: 8, name: 'Ryan Garcia', position: 'Forward', squad_no: 7, sponsor: 'Nike' }
        ];
        setSquad(sampleData);
        setAvailablePlayers(sampleData);
      }
    } catch (err) {
      console.error("Error fetching squad:", err);
      setError("Failed to load squad data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initialize data
  useEffect(() => {
    fetchSquad();
  }, [fetchSquad]);

  // Enhanced toggle handler
  const handleToggle = useCallback((value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  }, [checked]);

  // Move players to Starting XI
  const handleMoveToStartingXI = useCallback(() => {
    const selectedPlayerObjects = availablePlayers.filter(player => 
      checked.includes(player.name)
    );

    if (selectedPlayerObjects.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one player",
        severity: "warning"
      });
      return;
    }

    setSelectedPlayers(prev => [...prev, ...selectedPlayerObjects]);
    setAvailablePlayers(prev => not(prev, selectedPlayerObjects));
    setChecked([]);
    
    setSnackbar({
      open: true,
      message: `${selectedPlayerObjects.length} player(s) added to Starting XI`,
      severity: "success"
    });
  }, [availablePlayers, checked]);

  // Move players back to available
  const handleMoveToAvailable = useCallback(() => {
    const selectedPlayerObjects = selectedPlayers.filter(player => 
      checked.includes(player.name)
    );

    setAvailablePlayers(prev => [...prev, ...selectedPlayerObjects]);
    setSelectedPlayers(prev => not(prev, selectedPlayerObjects));
    setChecked([]);
    
    setSnackbar({
      open: true,
      message: `${selectedPlayerObjects.length} player(s) moved back to available`,
      severity: "info"
    });
  }, [selectedPlayers, checked]);

  // Generate Starting XI graphic
  const handleGenerateGraphic = useCallback(async () => {
    if (selectedPlayers.length < 1) {
      setSnackbar({
        open: true,
        message: "Please select at least one player for Starting XI",
        severity: "warning"
      });
      return;
    }

    try {
      setGenerating(true);
      const playerNames = selectedPlayers.map(player => player.name);
      const response = await generateStartingXIGraphic(token, playerNames);
      setImageUrl(response.data.image_url);
      setShowPreview(true);
      setSuccess("Starting XI graphic generated successfully!");
    } catch (error) {
      console.error("Error generating graphic:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate graphic. Please try again.",
        severity: "error"
      });
    } finally {
      setGenerating(false);
    }
  }, [selectedPlayers, token]);

  // Reset selection
  const handleReset = useCallback(() => {
    setSelectedPlayers([]);
    setAvailablePlayers(squad);
    setChecked([]);
    setImageUrl("");
    setSnackbar({
      open: true,
      message: "Starting XI selection reset",
      severity: "info"
    });
  }, [squad]);

  // Position color mapping
  const getPositionColor = (position) => {
    const colors = {
      'Goalkeeper': 'error',
      'Defender': 'warning',
      'Midfielder': 'info',
      'Forward': 'success',
      'Striker': 'secondary'
    };
    return colors[position] || 'default';
  };

  // Player list component
  const PlayerList = ({ title, players, emptyMessage }) => (
    <Card sx={{ height: '100%', minHeight: 400 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon color="primary" />
            <Typography variant="h6" fontWeight="600">
              {title}
            </Typography>
            <Chip 
              label={players.length} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        }
        subheader={`${intersection(checked, players.map(p => p.name)).length}/${players.length} selected`}
        action={
          <Checkbox
            onClick={() => {
              const playerNames = players.map(p => p.name);
              setChecked(prev => 
                intersection(prev, playerNames).length === playerNames.length 
                  ? not(prev, playerNames) 
                  : [...prev, ...playerNames]
              );
            }}
            checked={
              intersection(checked, players.map(p => p.name)).length === players.length && 
              players.length !== 0
            }
            indeterminate={
              intersection(checked, players.map(p => p.name)).length !== players.length &&
              intersection(checked, players.map(p => p.name)).length !== 0
            }
            disabled={players.length === 0}
          />
        }
      />
      <Divider />
      <List sx={{ height: 300, overflow: 'auto' }} dense>
        {players.length === 0 ? (
          <ListItem>
            <ListItemText 
              primary={emptyMessage} 
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          players.map((player) => {
            const labelId = `player-${player.id}`;
            return (
              <ListItem key={player.id} disablePadding>
                <ListItemButton onClick={handleToggle(player.name)} dense>
                  <ListItemIcon>
                    <Checkbox
                      checked={checked.includes(player.name)}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <Avatar
                      src={player.player_pic}
                      sx={{ width: 32, height: 32 }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight="600">
                          {player.name}
                        </Typography>
                        {player.squad_no && (
                          <Chip
                            label={`#${player.squad_no}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={player.position}
                          size="small"
                          color={getPositionColor(player.position)}
                          variant="outlined"
                          icon={<SoccerIcon />}
                        />
                        {player.sponsor && (
                          <Chip
                            label={player.sponsor}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })
        )}
      </List>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Loading Squad Data...
            </Typography>
          </Stack>
        </Card>
      </Fade>
    );
  }

  // Error state
  if (error) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={3} alignItems="center" maxWidth={400}>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={fetchSquad}
              startIcon={<RefreshIcon />}
            >
              Try Again
            </Button>
          </Stack>
        </Card>
      </Fade>
    );
  }

  return (
    <Zoom in={true} timeout={500}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            Starting XI Selection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select your starting lineup for the upcoming match
          </Typography>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Available Players */}
          <Grid item xs={12} md={5}>
            <PlayerList
              title="Available Players"
              players={availablePlayers}
              emptyMessage="No players available"
            />
          </Grid>

          {/* Transfer Controls */}
          <Grid item xs={12} md={2}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              gap: 2
            }}>
              <Tooltip title="Add to Starting XI">
                <IconButton
                  onClick={handleMoveToStartingXI}
                  disabled={intersection(checked, availablePlayers.map(p => p.name)).length === 0}
                  color="primary"
                  size="large"
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'grey.300' }
                  }}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Remove from Starting XI">
                <IconButton
                  onClick={handleMoveToAvailable}
                  disabled={intersection(checked, selectedPlayers.map(p => p.name)).length === 0}
                  color="secondary"
                  size="large"
                  sx={{ 
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'secondary.dark' },
                    '&:disabled': { bgcolor: 'grey.300' }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {/* Selected Starting XI */}
          <Grid item xs={12} md={5}>
            <PlayerList
              title="Starting XI"
              players={selectedPlayers}
              emptyMessage="No players selected"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGenerateGraphic}
            disabled={selectedPlayers.length < 1 || generating}
            startIcon={generating ? <CircularProgress size={20} /> : <TrophyIcon />}
          >
            {generating ? 'Generating...' : 'Generate Starting XI Graphic'}
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleReset}
            startIcon={<ClearIcon />}
          >
            Reset Selection
          </Button>
          
          {imageUrl && (
            <Button
              variant="outlined"
              color="success"
              onClick={() => setShowPreview(true)}
              startIcon={<ViewIcon />}
            >
              View Graphic
            </Button>
          )}
        </Box>

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}

        {/* Preview Dialog */}
        <Dialog
          open={showPreview}
          onClose={() => setShowPreview(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrophyIcon color="primary" />
              <Typography variant="h6" sx={{ color: 'white' }}>
                Starting XI Graphic
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ color: 'white' }}>
            {imageUrl && (
              <Box sx={{ textAlign: 'center' }}>
                <img 
                  src={imageUrl} 
                  alt="Starting XI Graphic" 
                  style={{ 
                    maxWidth: '100%', 
                    height: 'auto',
                    border: `2px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius
                  }} 
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowPreview(false)}
              sx={{ color: 'white' }}
            >
              Close
            </Button>
            {imageUrl && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imageUrl;
                  link.download = 'starting-xi-graphic.png';
                  link.click();
                }}
              >
                Download
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Zoom>
  );
}