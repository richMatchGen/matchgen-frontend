import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  Container,
  CircularProgress,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditorIcon,
  Visibility as ViewerIcon,
  Star as OwnerIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import axios from 'axios';
import AppTheme from '../themes/AppTheme';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavBar';
import Header from '../components/Header';
import FeatureRestrictedButton from '../components/FeatureRestrictedButton';

const TeamManagement = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role_id: '',
    message: ''
  });
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    role_id: ''
  });

  const selectedClubId = localStorage.getItem('selectedClubId');

  useEffect(() => {
    if (selectedClubId) {
      fetchTeamData();
    }
  }, [selectedClubId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? 'https://matchgen-backend-production.up.railway.app/api/'
        : 'http://localhost:8000/api/';
        
      const response = await axios.get(
        `${API_BASE_URL}users/team-management/?club_id=${selectedClubId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setTeamData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? 'https://matchgen-backend-production.up.railway.app/api/'
        : 'http://localhost:8000/api/';
        
      await axios.post(
        `${API_BASE_URL}users/team-management/`,
        {
          ...inviteForm,
          club_id: selectedClubId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSnackbar({
        open: true,
        message: `Invitation sent to ${inviteForm.email}`,
        severity: 'success'
      });
      
      setInviteDialogOpen(false);
      setInviteForm({ email: '', role_id: '', message: '' });
      fetchTeamData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to send invitation',
        severity: 'error'
      });
    }
  };

  const handleUpdateRole = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? 'https://matchgen-backend-production.up.railway.app/api/'
        : 'http://localhost:8000/api/';
        
      await axios.put(
        `${API_BASE_URL}users/members/${selectedMember.id}/update-role/`,
        {
          role_id: editForm.role_id,
          club_id: selectedClubId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSnackbar({
        open: true,
        message: `Role updated for ${selectedMember.user.email}`,
        severity: 'success'
      });
      
      setEditDialogOpen(false);
      setSelectedMember(null);
      setEditForm({ role_id: '' });
      fetchTeamData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to update role',
        severity: 'error'
      });
    }
  };

  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const handleRemoveMember = async (memberId, memberEmail) => {
    setMemberToRemove({ id: memberId, email: memberEmail });
    setRemoveDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.MODE === 'production' 
        ? 'https://matchgen-backend-production.up.railway.app/api/'
        : 'http://localhost:8000/api/';
        
      await axios.delete(
        `${API_BASE_URL}users/members/${memberToRemove.id}/remove/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { club_id: selectedClubId }
        }
      );
      
      setSnackbar({
        open: true,
        message: `Member ${memberToRemove.email} removed from team`,
        severity: 'success'
      });
      
      setRemoveDialogOpen(false);
      setMemberToRemove(null);
      fetchTeamData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to remove member',
        severity: 'error'
      });
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'owner':
        return <OwnerIcon color="warning" />;
      case 'admin':
        return <AdminIcon color="primary" />;
      case 'editor':
        return <EditorIcon color="secondary" />;
      case 'viewer':
        return <ViewerIcon color="action" />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'owner':
        return 'warning';
      case 'admin':
        return 'primary';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Header title="Team & Roles Management" />
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  if (error) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Header title="Team & Roles Management" />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Alert severity="error">{error}</Alert>
            </Container>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  if (!teamData) {
    return (
      <AppTheme>
        <Box sx={{ display: 'flex' }}>
          <SideMenu />
          <Box sx={{ flexGrow: 1 }}>
            <AppNavbar />
            <Header title="Team & Roles Management" />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Alert severity="info">No team data available</Alert>
            </Container>
          </Box>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Header title="Team & Roles Management" />
          
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              Team & Roles Management
            </Typography>
      
      {/* Team Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <GroupIcon color="primary" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Team Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your team members and their roles. You have {teamData.members.length} team member{teamData.members.length !== 1 ? 's' : ''}.
                  </Typography>
                </Box>
              </Box>
              
              {/* Team Stats */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={2} bgcolor="primary.light" borderRadius={1}>
                    <Typography variant="h6" color="white">
                      {teamData.members.filter(m => m.status === 'active').length}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Active Members
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={2} bgcolor="warning.light" borderRadius={1}>
                    <Typography variant="h6" color="white">
                      {teamData.members.filter(m => m.status === 'pending').length}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Pending Invites
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={2} bgcolor="secondary.light" borderRadius={1}>
                    <Typography variant="h6" color="white">
                      {teamData.members.filter(m => m.role.name === 'admin').length}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Admins
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center" p={2} bgcolor="info.light" borderRadius={1}>
                    <Typography variant="h6" color="white">
                      {teamData.available_roles.length}
                    </Typography>
                    <Typography variant="caption" color="white">
                      Available Roles
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4} textAlign="right">
              <Box display="flex" flexDirection="column" gap={2}>
                {teamData.can_manage_members && (
                  <FeatureRestrictedButton
                    featureCode="team_management"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setInviteDialogOpen(true)}
                    size="large"
                    sx={{ minWidth: 200 }}
                    tooltipText="Team management requires SemiPro Gen or higher"
                    upgradeDialogTitle="Team Management Feature"
                    upgradeDialogDescription="Invite and manage team members with different roles and permissions."
                  >
                    Invite Team Member
                  </FeatureRestrictedButton>
                )}
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchTeamData}
                  size="small"
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <SecurityIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Team Members ({teamData.members.length})
            </Typography>
          </Box>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Member</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Invited By</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                  {teamData.can_manage_members && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.members.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: getRoleColor(member.role.name) + '.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {member.user.email}
                          </Typography>
                          {member.user.username && (
                            <Typography variant="caption" color="text.secondary">
                              {member.user.username}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(member.role.name)}
                        label={member.role.name.charAt(0).toUpperCase() + member.role.name.slice(1)}
                        color={getRoleColor(member.role.name)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={member.status === 'active' ? <CheckIcon /> : <WarningIcon />}
                        label={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        color={member.status === 'active' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {member.invited_by ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {member.invited_by.email}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.accepted_at 
                          ? new Date(member.accepted_at).toLocaleDateString()
                          : new Date(member.invited_at).toLocaleDateString()
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {member.accepted_at ? 'Accepted' : 'Invited'}
                      </Typography>
                    </TableCell>
                    {teamData.can_manage_members && (
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Role">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedMember(member);
                                setEditForm({ role_id: member.role.id });
                                setEditDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove Member">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveMember(member.id, member.user.email)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog 
        open={inviteDialogOpen} 
        onClose={() => setInviteDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <EmailIcon color="primary" />
            <Typography variant="h6">Invite Team Member</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <Alert severity="info" icon={<InfoIcon />}>
              Send an invitation to join your team. The user will receive an email with instructions to accept the invitation.
            </Alert>
            
            <TextField
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              fullWidth
              required
              placeholder="Enter the email address of the person you want to invite"
            />
            
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={inviteForm.role_id}
                onChange={(e) => setInviteForm({ ...inviteForm, role_id: e.target.value })}
                label="Role"
              >
                {teamData.available_roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {getRoleIcon(role.name)}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Personal Message (Optional)"
              multiline
              rows={3}
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              fullWidth
              placeholder="Add a personal message to make the invitation more welcoming..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleInviteUser} 
            variant="contained"
            disabled={!inviteForm.email || !inviteForm.role_id}
            startIcon={<EmailIcon />}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <EditIcon color="primary" />
            <Typography variant="h6">Update Role</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <Alert severity="info" icon={<InfoIcon />}>
              Change the role for <strong>{selectedMember?.user.email}</strong>. This will affect their permissions and access levels.
            </Alert>
            
            <FormControl fullWidth required>
              <InputLabel>New Role</InputLabel>
              <Select
                value={editForm.role_id}
                onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                label="New Role"
              >
                {teamData.available_roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box display="flex" alignItems="center" gap={2}>
                      {getRoleIcon(role.name)}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateRole} 
            variant="contained"
            disabled={!editForm.role_id}
            startIcon={<EditIcon />}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog 
        open={removeDialogOpen} 
        onClose={() => setRemoveDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Remove Team Member</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <Alert severity="warning" icon={<WarningIcon />}>
              Are you sure you want to remove <strong>{memberToRemove?.email}</strong> from the team?
            </Alert>
            
            <Typography variant="body2" color="text.secondary">
              This action will:
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Remove their access to the club" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WarningIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Delete all their club memberships" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoIcon color="info" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="This action cannot be undone" />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={confirmRemoveMember} 
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Remove Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
          </Container>
        </Box>
      </Box>
    </AppTheme>
  );
};

export default TeamManagement;
