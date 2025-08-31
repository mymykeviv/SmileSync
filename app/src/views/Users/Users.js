import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  PersonOff as DeactivateIcon,
  PersonAdd as ActivateIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  VpnKey as PasswordIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import UserForm from './UserForm';
import PasswordChangeDialog from './PasswordChangeDialog';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('true');
  
  // Dialogs
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: '' });
  
  // Statistics
  const [roleStats, setRoleStats] = useState({});

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'assistant', label: 'Dental Assistant' },
    { value: 'receptionist', label: 'Receptionist' },
    { value: 'staff', label: 'Staff' }
  ];

  useEffect(() => {
    loadUsers();
    loadRoleStats();
  }, [page, rowsPerPage, searchTerm, roleFilter, activeFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        active_only: activeFilter
      };
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      if (roleFilter) {
        params.role = roleFilter;
      }
      
      const response = await ApiService.getUsers(params);
      
      if (response.success) {
        setUsers(response.data || []);
        setTotalCount(response.pagination?.totalCount || 0);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleStats = async () => {
    try {
      const response = await ApiService.getUserStats();
      if (response.success) {
        setRoleStats(response.data);
      }
    } catch (error) {
      console.error('Error loading role stats:', error);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadUsers();
  };

  const handleRefresh = () => {
    setPage(0);
    setSearchTerm('');
    setRoleFilter('');
    setActiveFilter('true');
    loadUsers();
    loadRoleStats();
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserFormOpen(true);
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const handleToggleActive = (user) => {
    setConfirmDialog({
      open: true,
      user,
      action: user.isActive ? 'deactivate' : 'activate'
    });
  };

  const confirmToggleActive = async () => {
    try {
      const { user, action } = confirmDialog;
      
      if (action === 'deactivate') {
        await ApiService.deactivateUser(user.id);
        setSuccess(`${user.firstName} ${user.lastName} has been deactivated`);
      } else {
        await ApiService.activateUser(user.id);
        setSuccess(`${user.firstName} ${user.lastName} has been activated`);
      }
      
      setConfirmDialog({ open: false, user: null, action: '' });
      loadUsers();
      loadRoleStats();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleUserSaved = () => {
    setUserFormOpen(false);
    setSelectedUser(null);
    loadUsers();
    loadRoleStats();
    setSuccess('User saved successfully');
  };

  const handlePasswordChanged = () => {
    setPasswordDialogOpen(false);
    setSelectedUser(null);
    setSuccess('Password updated successfully');
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      dentist: 'primary',
      assistant: 'secondary',
      receptionist: 'info',
      staff: 'default'
    };
    return colors[role] || 'default';
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{ ml: 2 }}
        >
          Add Staff Member
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Role Statistics */}
      {Object.keys(roleStats).length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {roles.map(role => (
            <Grid item xs={12} sm={6} md={2.4} key={role.value}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h4" color={getRoleColor(role.value) + '.main'}>
                    {roleStats[role.value] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {role.label}s
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Status"
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <MenuItem value="true">Active Only</MenuItem>
              <MenuItem value="false">Inactive Only</MenuItem>
              <MenuItem value="">All Users</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>License #</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                      {user.specialization && (
                        <Typography variant="caption" color="text.secondary">
                          {user.specialization}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>{user.licenseNumber || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit User">
                        <IconButton
                          size="small"
                          onClick={() => handleEditUser(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Change Password">
                        <IconButton
                          size="small"
                          onClick={() => handleChangePassword(user)}
                        >
                          <PasswordIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(user)}
                          color={user.isActive ? 'error' : 'success'}
                        >
                          {user.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* User Form Dialog */}
      <UserForm
        open={userFormOpen}
        user={selectedUser}
        onClose={() => setUserFormOpen(false)}
        onSave={handleUserSaved}
      />

      {/* Password Change Dialog */}
      <PasswordChangeDialog
        open={passwordDialogOpen}
        user={selectedUser}
        onClose={() => setPasswordDialogOpen(false)}
        onSave={handlePasswordChanged}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, user: null, action: '' })}
      >
        <DialogTitle>
          {confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'} User
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action} {confirmDialog.user?.firstName} {confirmDialog.user?.lastName}?
            {confirmDialog.action === 'deactivate' && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="warning.main">
                  This user will no longer be able to access the system.
                </Typography>
              </Box>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, user: null, action: '' })}>
            Cancel
          </Button>
          <Button
            onClick={confirmToggleActive}
            color={confirmDialog.action === 'deactivate' ? 'error' : 'success'}
            variant="contained"
          >
            {confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;