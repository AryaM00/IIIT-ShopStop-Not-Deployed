import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '4rem', md: '6rem' } }}>
        404
      </Typography>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => navigate('/')}
        size="large"
      >
        Back to Home
      </Button>
    </Box>
  );
};

export default NotFound;