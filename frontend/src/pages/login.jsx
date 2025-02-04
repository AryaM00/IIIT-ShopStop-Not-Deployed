import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Grid, Box, Alert, CircularProgress, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ReCAPTCHA from "react-google-recaptcha";
import { useAuthContext } from '../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { dispatch } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const checkToken = () => {

      const user = JSON.parse(localStorage.getItem('user'));
      if(user){
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

  const isEmailValid = email.match( /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*iiit\.ac\.in$/);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailValid) return setError('Invalid IIIT email format');
    if (!password) return setError('Password is required');
    if (!captchaValue) return setError('Please complete the captcha');

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          captchaToken: captchaValue 
        }),
      });
      const data = await response.json();
      // console.log(data);
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        dispatch({ type: 'LOGIN', payload: data });
        window.location.href = '/profile';
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleCASLogin = async () => {

        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/user/cas/login`;


      

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
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
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
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box my={3} display="flex" justifyContent="center">
              <ReCAPTCHA
                sitekey="6LeAf8UqAAAAAJ6Tnp7F8xNg5tEVgXBOXHrR26Cf"
                onChange={handleCaptchaChange}
              />
            </Box>
            {error && <Alert severity="error" style={{ marginTop: '1rem' }}>{error}</Alert>}
            <Box mt={3}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth 
                disabled={loading || !captchaValue}
                style={{ height: '50px' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCASLogin}
                sx={{ mt: 2 }}
              >
                CAS LOGIN
              </Button>
            </Box>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;