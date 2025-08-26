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
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditorIcon,
  Visibility as ViewerIcon,
  Star as OwnerIcon
} from '@mui/icons-material';
import axios from 'axios';

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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users/team-management/?club_id=${selectedClubId}`,
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
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/team-management/`,
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
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/members/${selectedMember.id}/update-role/`,
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

  const handleRemoveMember = async (memberId, memberEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/users/members/${memberId}/remove/`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { club_id: selectedClubId }
        }
      );
      
      setSnackbar({
        open: true,
        message: `Member ${memberEmail} removed from team`,
        severity: 'success'
      });
      
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading team data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!teamData) {
    return (
      <Box p={3}>
        <Alert severity="info">No team data available</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Team & Roles Management
      </Typography>
      
      {/* Team Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Team Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your team members and their roles
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
              {teamData.can_manage_members && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setInviteDialogOpen(true)}
                >
                  Invite Team Member
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invited By</TableCell>
                <TableCell>Joined</TableCell>
                {teamData.can_manage_members && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {teamData.members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon />
                      <Box>
                        <Typography variant="body2">
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
                      label={member.role.name}
                      color={getRoleColor(member.role.name)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status}
                      color={member.status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {member.invited_by ? member.invited_by.email : '-'}
                  </TableCell>
                  <TableCell>
                    {member.accepted_at 
                      ? new Date(member.accepted_at).toLocaleDateString()
                      : new Date(member.invited_at).toLocaleDateString()
                    }
                  </TableCell>
                  {teamData.can_manage_members && (
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Role">
                          <IconButton
                            size="small"
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
      </Paper>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Team Member</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              fullWidth
              required
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
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRoleIcon(role.name)}
                      <Box>
                        <Typography variant="body2">{role.name}</Typography>
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
              label="Message (Optional)"
              multiline
              rows={3}
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              fullWidth
              placeholder="Add a personal message to the invitation..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleInviteUser} 
            variant="contained"
            disabled={!inviteForm.email || !inviteForm.role_id}
          >
            Send Invitation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Role</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Typography variant="body2" color="text.secondary">
              Update role for {selectedMember?.user.email}
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>New Role</InputLabel>
              <Select
                value={editForm.role_id}
                onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
                label="New Role"
              >
                {teamData.available_roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRoleIcon(role.name)}
                      <Box>
                        <Typography variant="body2">{role.name}</Typography>
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
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateRole} 
            variant="contained"
            disabled={!editForm.role_id}
          >
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamManagement;
