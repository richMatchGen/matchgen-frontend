import * as React from 'react';
import { useState, useEffect, useCallback } from "react";
import { 
  DataGrid, 
  GridToolbar,
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons
} from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  SportsSoccer as SoccerIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { getSquad, addPlayer } from "../hooks/club";
import { getToken } from "../hooks/auth";
import { useNavigate } from "react-router-dom";

// Enhanced column definitions with better formatting and actions
const createColumns = (theme, handleEdit, handleDelete, handleView) => [
  {
    field: 'player_pic',
    headerName: 'Photo',
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      if (params.value) {
        return (
          <Avatar
            src={params.value}
            alt={params.row.name}
            sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.primary.main}` }}
          />
        );
      }
      return (
        <Avatar
          sx={{ 
            width: 40, 
            height: 40, 
            bgcolor: theme.palette.primary.main,
            border: `2px solid ${theme.palette.primary.light}`
          }}
        >
          <PersonIcon />
        </Avatar>
      );
    }
  },
  {
    field: 'name',
    headerName: 'Player Name',
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <Box>
        <Typography variant="subtitle2" fontWeight="600">
          {params.value}
        </Typography>
        {params.row.squad_no && (
          <Typography variant="caption" color="text.secondary">
            #{params.row.squad_no}
          </Typography>
        )}
      </Box>
    )
  },
  {
    field: 'position',
    headerName: 'Position',
    width: 120,
    renderCell: (params) => {
      const positionColors = {
        'Goalkeeper': 'error',
        'Defender': 'warning',
        'Midfielder': 'info',
        'Forward': 'success',
        'Striker': 'secondary'
      };
      
      return (
        <Chip
          label={params.value}
          color={positionColors[params.value] || 'default'}
          size="small"
          variant="outlined"
          icon={<SoccerIcon />}
        />
      );
    }
  },
  {
    field: 'squad_no',
    headerName: 'Squad #',
    width: 100,
    align: 'center',
    renderCell: (params) => (
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.875rem'
        }}
      >
        {params.value || '?'}
      </Box>
    )
  },
  {
    field: 'sponsor',
    headerName: 'Sponsor',
    width: 150,
    renderCell: (params) => {
      if (!params.value) return '-';
      return (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          sx={{ 
            borderColor: theme.palette.success.main,
            color: theme.palette.success.main 
          }}
        />
      );
    }
  },
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 120,
    getActions: (params) => [
      <GridActionsCellItem
        icon={
          <Tooltip title="View Player Details">
            <ViewIcon />
          </Tooltip>
        }
        label="View"
        onClick={() => handleView(params.row)}
        color="primary"
      />,
      <GridActionsCellItem
        icon={
          <Tooltip title="Edit Player">
            <EditIcon />
          </Tooltip>
        }
        label="Edit"
        onClick={() => handleEdit(params.row)}
        color="info"
      />,
      <GridActionsCellItem
        icon={
          <Tooltip title="Delete Player">
            <DeleteIcon />
          </Tooltip>
        }
        label="Delete"
        onClick={() => handleDelete(params.row)}
        color="error"
      />
    ]
  }
];

// Enhanced DataGrid component with better UI and functionality
export default function CustomizedDataGrid({ user }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const token = localStorage.getItem("accessToken");

  // Enhanced data fetching with better error handling
  const fetchSquad = useCallback(async () => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await getSquad(token);
      
      // Transform the data to ensure proper formatting
      const transformedSquad = response.data.map((player, index) => ({
        id: player.id || index + 1,
        name: player.name || 'Unknown Player',
        position: player.position || 'Unknown',
        squad_no: player.squad_no || null,
        sponsor: player.sponsor || null,
        player_pic: player.player_pic || null,
        // Add any additional fields from the API
        ...player
      }));

      setSquad(transformedSquad);
    } catch (err) {
      console.error("Error fetching squad:", err);
      
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (err.response?.status === 404) {
        setError("No squad data found. Create your first player!");
      } else {
        setError("Failed to load squad data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSquad();
    setRefreshing(false);
  }, [fetchSquad]);

  // Action handlers
  const handleEdit = useCallback((player) => {
    console.log("Edit player:", player);
    // TODO: Implement edit functionality
  }, []);

  const handleDelete = useCallback((player) => {
    console.log("Delete player:", player);
    // TODO: Implement delete functionality
  }, []);

  const handleView = useCallback((player) => {
    console.log("View player:", player);
    // TODO: Implement view functionality
  }, []);

  const handleAddPlayer = useCallback(() => {
    // TODO: Navigate to add player page or open modal
    console.log("Add new player");
  }, []);

  // Initialize data
  useEffect(() => {
    fetchSquad();
  }, [fetchSquad]);

  // Create columns with handlers
  const columns = createColumns(theme, handleEdit, handleDelete, handleView);

  // Loading state
  if (loading && squad.length === 0) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Loading Squad Data...
            </Typography>
            <LinearProgress sx={{ width: 200 }} />
          </Stack>
        </Card>
      </Fade>
    );
  }

  // Error state
  if (error && squad.length === 0) {
    return (
      <Fade in={true} timeout={500}>
        <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Stack spacing={3} alignItems="center" maxWidth={400}>
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Try Again'}
            </Button>
          </Stack>
        </Card>
      </Fade>
    );
  }

  // Empty state
  if (!loading && !error && squad.length === 0) {
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
              <GroupIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="600" textAlign="center">
              No Players Found
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Start building your squad by adding your first player
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleAddPlayer}
              startIcon={<AddIcon />}
            >
              Add First Player
            </Button>
          </Stack>
        </Card>
      </Fade>
    );
  }

  return (
    <Zoom in={true} timeout={500}>
      <Paper 
        elevation={0}
        sx={{ 
          height: 600,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Enhanced Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 40,
                height: 40
              }}
            >
              <SoccerIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600">
                Squad Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {squad.length} player{squad.length !== 1 ? 's' : ''} in your squad
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Squad">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPlayer}
              size="small"
            >
              Add Player
            </Button>
          </Stack>
        </Box>

        {/* Enhanced DataGrid */}
        <DataGrid
          rows={squad}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25, 50]}
          loading={loading || refreshing}
          disableRowSelectionOnClick
          autoHeight={false}
          density="comfortable"
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: theme.palette.grey[50],
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: theme.palette.action.hover,
            },
            '& .MuiDataGrid-row.Mui-selected': {
              bgcolor: theme.palette.primary.light,
              '&:hover': {
                bgcolor: theme.palette.primary.light,
              },
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${theme.palette.divider}`,
            }
          }}
          slots={{
            toolbar: GridToolbar,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
              csvOptions: { disableToolbarButton: false },
              printOptions: { disableToolbarButton: true },
            },
          }}
        />
      </Paper>
    </Zoom>
  );
}
