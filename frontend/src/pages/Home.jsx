import React from 'react';
import { Box, Typography, Container, Grid, Button, Card, CardContent } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import SupportIcon from '@mui/icons-material/Support';
import landingpage from '../assets/landingpage.jpg';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleNavigateToProducts = () => {
    navigate('/products');
  };
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        mt:'0px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${landingpage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center-bottom',
          filter: 'brightness(0.7)',
          zIndex: -1
        }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ color: 'white', textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700,
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Welcome to IIIT ShopStop
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Empowering buyers and sellers in our campus community
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={handleNavigateToProducts}
              sx={{
                py: 2,
                px: 4,
                fontSize: '1.1rem',
                textTransform: 'none',
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 4px rgba(33, 150, 243, .3)'
                },
                transition: 'all 0.3s ease'
              }}

            >

              Start Shopping
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            mb: 6,
            color: 'primary.main'
          }}
        >
          Why Choose Us
        </Typography>
        <Grid container spacing={4}>
          {[
            { icon: <ShoppingCartIcon sx={{ fontSize: 40 }}/>, title: 'Easy Trading', description: 'Simple and secure buying and selling process' },
            { icon: <SecurityIcon sx={{ fontSize: 40 }}/>, title: 'Secure Platform', description: 'Verified users and secure transactions' },
            { icon: <PeopleIcon sx={{ fontSize: 40 }}/>, title: 'Campus Community', description: 'Connect with fellow students' },
            { icon: <SupportIcon sx={{ fontSize: 40 }}/>, title: '24/7 Support', description: 'Always here to help you' }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        py: 8,
        textAlign: 'center'
      }}>
        <Container maxWidth="md">
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Ready to Start Trading?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Join our community and start buying and selling today
          </Typography>
          <Button 
            onClick={handleNavigateToProducts}
            variant="outlined" 
            size="large"
            sx={{
              color: 'white',
              borderColor: 'white',
              borderWidth: 2,
              py: 1.5,
              px: 4,
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Get Started
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;