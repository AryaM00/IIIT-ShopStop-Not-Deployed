import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  Avatar,
  Divider,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';

const Profile = () => {
  const { user,dispatch } = useAuthContext();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    contactNumber: '',
  });
  const [editableField, setEditableField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tempValue, setTempValue] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        if (user && user.user) {
          const { firstName, lastName, email, age, contactNumber } = user.user;
          if (isMounted) {
            setProfileData({ firstName, lastName, email, age, contactNumber });
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch profile');
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleEdit = (field, value) => {
    setEditableField(field);
    setTempValue(value);
  };

  const handleCancel = () => {
    setEditableField(null);
    setTempValue('');
  };
  const handleSave = async (field) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${user.user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: tempValue })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
  
      // Remove old data first
      localStorage.removeItem('user');
  
      // Create updated user object
      const updatedUser = {
        ...user,
        user: {
          ...user.user,
          [field]: tempValue
        }
      };
  
      // Set new data in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
  
      // Update context
      dispatch({ type: 'LOGIN', payload: updatedUser });
  
      // Update local state
      setProfileData(prev => ({ ...prev, [field]: tempValue }));
      setSuccess(true);
      setEditableField(null);
      setTempValue('');
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords don't match");
      setSnackbarMessage("Passwords don't match");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/user/password/${user.user._id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.status === 200) {
        // Clear form and show success
        setShowPasswordChange(false);
        setPasswordError('');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setSnackbarMessage('Password updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

      }
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to update password');
      setSnackbarMessage(err.response?.data?.error || 'Failed to update password');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
};

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f5f5', 
      py: 6, 
      px: { xs: 2, md: 4 } 
    }}>
      <Paper elevation={3} sx={{ 
        maxWidth: '800px', 
        margin: 'auto', 
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header Section */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 4,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
        }}>
          <Avatar sx={{ 
            width: 100, 
            height: 100, 
            bgcolor: 'white',
            color: 'primary.main',
            mb: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <PersonIcon sx={{ fontSize: 50 }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {profileData.firstName} {profileData.lastName}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {profileData.email}
          </Typography>
        </Box>
  
        {/* Main Content */}
        <Box sx={{ p: 4 }}>
          {/* Personal Information Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              pb: 1,
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              width: 'fit-content'
            }}>
              Personal Information
            </Typography>
  
            {['firstName', 'lastName', 'age', 'contactNumber', 'email'].map((field) => (
              <Box key={field} sx={{ 
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: editableField === field ? 'grey.50' : 'transparent',
                transition: 'all 0.3s ease'
              }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  {field.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + field.slice(1)}
                </Typography>
                
                {editableField === field ? (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      disabled={field === 'email'}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'white'
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleSave(field)}
                      startIcon={<SaveIcon />}
                      variant="contained"
                      sx={{
                        py: 1,
                        px: 3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      startIcon={<CancelIcon />}
                      sx={{
                        py: 1,
                        px: 3,
                        borderRadius: 2,
                        textTransform: 'none'
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{profileData[field]}</Typography>
                    {field !== 'email' && (
                      <Button
                        onClick={() => handleEdit(field, profileData[field])}
                        startIcon={<EditIcon />}
                        size="small"
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.50'
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Box>
  
          {/* Password Change Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              pb: 1,
              borderBottom: '2px solid',
              borderColor: 'primary.main',
              width: 'fit-content'
            }}>
              Security Settings
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}
            >
              Change Password
            </Button>
  
            {showPasswordChange && (
              <Box component="form" onSubmit={handlePasswordChange} sx={{ 
                mt: 3,
                p: 3,
                bgcolor: 'grey.50',
                borderRadius: 2
              }}>
                <TextField
                  type="password"
                  fullWidth
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white'
                    }
                  }}
                  required
                />
                <TextField
                  type="password"
                  fullWidth
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white'
                    }
                  }}
                  required
                />
                <TextField
                  type="password"
                  fullWidth
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white'
                    }
                  }}
                  required
                  error={Boolean(passwordError)}
                  helperText={passwordError}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                      }
                    }}
                  >
                    Update Password
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordError('');
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    startIcon={<CancelIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      textTransform: 'none'
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      <Snackbar 
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={() => setSnackbarOpen(false)} 
        severity={snackbarSeverity}
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>

    </Box>
  );
};

export default Profile;