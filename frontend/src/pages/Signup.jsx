import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Grid, Box, Alert, CircularProgress } from '@mui/material';
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  // State variables for form fields and feedback
    const { dispatch } = useAuthContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkToken = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if(user)
      {
      const token = user.token;

      if (token && user) {
        try {
          // Decode JWT payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Check if token is expired
          if (payload.exp * 1000 > Date.now()) {
            navigate('/profile');
          } else {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
    };

    checkToken();
  }, [navigate]);



  // Validation helper
  const isEmailValid = email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.?iiit\.ac\.in$/);
  const isContactNumberValid = contactNumber.match(/^\d{10}$/);
  const isPasswordMatching = password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log(firstName, lastName, email, age, contactNumber, password);

    // Basic validations
    if (!isEmailValid) return setError('Invalid IIIT email format');
    if (!isContactNumberValid) return setError('Contact number must be a 10-digit number');
    if (!isPasswordMatching) return setError('Passwords do not match');
    if (age < 18) return setError('Age must be 18 or above');

    setLoading(true);
    try {
      // API call to your backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, age, contactNumber, password }),
      });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            // save token in local storage
    
            localStorage.setItem('user', JSON.stringify(data));

        

            
            // update auth context
            dispatch({ type: 'LOGIN', payload: data });

            // Redirect to home page
            window.location.href = '/';
            setSuccess('Signup successful. Redirecting to home page...');
            // initialize information
            setFirstName('');
            setLastName('');
            setEmail('');
            setAge('');
            setContactNumber('');
            setPassword('');
            setConfirmPassword('');
            
        }
        else {

            setError(data.error || 'Signup failed. Please try again.');
        }

    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={8} md={6}>
        <Box 
          p={4} 
          boxShadow={3} 
          borderRadius={2} 
          bgcolor="white" 
          textAlign="center"
        >
          <Typography variant="h4" gutterBottom>
            Signup
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={email && !isEmailValid}
              helperText={email && !isEmailValid ? 'Use a valid IIIT email' : ''}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Contact Number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              error={contactNumber && !isContactNumberValid}
              helperText={contactNumber && !isContactNumberValid ? 'Enter a valid 10-digit number' : ''}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword && !isPasswordMatching}
              helperText={confirmPassword && !isPasswordMatching ? 'Passwords do not match' : ''}
              fullWidth
              margin="normal"
              required
            />
            {error && <Alert severity="error" style={{ marginTop: '1rem' }}>{error}</Alert>}
            {success && <Alert severity="success" style={{ marginTop: '1rem' }}>{success}</Alert>}
            <Box mt={3}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                disabled={loading}
                style={{ height: '50px' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
              </Button>
            </Box>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Signup;
