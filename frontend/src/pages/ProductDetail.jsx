import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const handleAddToCart = async () => {
    if (!user) {
      setErrorMessage('Please login to add items to cart');
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.user._id,
          productId: id,
          quantity: 1
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }
  
      setSuccessMessage('Item added to cart successfully');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };
  
  const handleSellerClick = () => {
    navigate(`/seller/${seller._id}`);
  };


  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        
        // Fetch seller details
        const sellerResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${data.sellerId}`);
        console.log('sellerResponse', sellerResponse);
        if (sellerResponse.ok) {
          const sellerData = await sellerResponse.json();
          setSeller(sellerData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Button
        onClick={() => navigate('/products')}
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 3,
          color: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.50',
          }
        }}
      >
        Back to Products
      </Button>
      <Grid container spacing={4}>
        {/* Product Image Section */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={product?.imageUrl}
              alt={product?.name}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 1
              }}
            />
          </Paper>
        </Grid>

        {/* Product Details Section */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" gutterBottom>
              {product?.name}
            </Typography>
            
            <Chip
              icon={<CategoryIcon />}
              label={product?.category}
              color="primary"
              sx={{ mb: 2, mr: 1 }}
            />

            <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
              ₹{product?.price?.toLocaleString('en-IN')}
            </Typography>

            <Box sx={{ my: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DescriptionIcon sx={{ mr: 1 }} />
                Description
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {product?.description}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddToCart}
              sx={{
                mt: 2,
                py: 1.5,
                width: '100%',
                borderRadius: 2,
                fontWeight: 'bold'
              }}
            >
              Add to Cart
            </Button>
            <Snackbar 
              open={Boolean(successMessage)} 
              autoHideDuration={3000} 
              onClose={() => setSuccessMessage('')}
            >
              <Alert severity="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            </Snackbar>

            <Snackbar 
              open={Boolean(errorMessage)} 
              autoHideDuration={3000} 
              onClose={() => setErrorMessage('')}
            >
              <Alert severity="error" onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            </Snackbar>
          </Box>

          {/* Seller Information */}
          <Card 
            sx={{ 
              mt: 3,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6
              }
            }}
            onClick={() => navigate(`/seller/${seller._id}`)}
          >
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                Seller Information
              </Typography>

              <Divider sx={{ mb: 2 }} />
              {seller && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {seller.firstName} {seller.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Email:</strong> {seller.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Contact:</strong> {seller.contactNumber}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;