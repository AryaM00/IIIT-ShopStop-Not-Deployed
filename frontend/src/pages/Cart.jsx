import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuthContext } from '../hooks/useAuthContext';
import { Link ,useNavigate} from 'react-router-dom';

const Cart = () => {
  const { user } = useAuthContext().user;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setError('User not logged in');
        setLoading(false);
        return;
      }
      console.log('user', user);
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart/${user._id}`);
        console.log(response);
        if (!response.ok) throw new Error('Failed to fetch cart');
        const data = await response.json();
        setCartItems(data.cart || []);
        calculateTotal(data.cart);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);
  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // First fetch product details for each cart item
      const orderItems = await Promise.all(cartItems.map(async (item) => {
        const productResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${item.product._id}`);
        const productData = await productResponse.json();
        
        return {
          productId: item.product._id,
          sellerId: productData.sellerId,
          quantity: item.quantity,
          price: productData.price,
          totalAmount: productData.price * item.quantity,
          productDetails: {
            name: productData.name,
            imageUrl: productData.imageUrl,
            category: productData.category
          }
        };
      }));
  
      // Create order
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId: user._id,
          items: orderItems
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const data = await response.json();
      
      // Clear cart
      
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart/clear/${user._id}`, {
        method: 'DELETE'
      });
  
      // Navigate to orders page
      navigate('/myorders', { 
        state: { 
          success: true,
          message: 'Order placed successfully'
        } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };
  

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
    setTotal(sum);
  };

  const handleQuantityChange = async (productId, change) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          productId,
          quantity: change
        })

      });
 
      if (!response.ok) throw new Error('Failed to update quantity');
      const data = await response.json();
      setCartItems(data.cart);
      calculateTotal(data.cart);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          productId
        })
      });
      if (!response.ok) throw new Error('Failed to remove item');
      const data = await response.json();
      setCartItems(data.cart);
      calculateTotal(data.cart);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!cartItems.length) return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {/* Shopping Cart Icon */}
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
  
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Your Cart is Empty
        </Typography>
  
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          Looks like you haven't added anything to your cart yet. Explore our products and find something you like!
        </Typography>
  
        <Button
          variant="contained"
          component={Link}
          to="/products"
          sx={{
            mt: 2,
            py: 1.5,
            px: 4,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(33, 150, 243, .4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Start Shopping
        </Button>
      </Box>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: 600,
          textAlign: 'center',
          color: 'primary.main',
          borderBottom: '3px solid',
          borderColor: 'primary.main',
          pb: 2,
          width: 'fit-content',
          mx: 'auto'
        }}
      >
        Shopping Cart
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Card 
              key={item.product._id} 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Grid container sx={{ p: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Box
                    sx={{
                      height: 200,
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.product.imageUrl}
                      alt={item.product.name}
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      {item.product.name}
                    </Typography>
                    <Typography 
                      variant="h5" 
                      color="primary"
                      sx={{ 
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </Typography>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mt: 2,
                        p: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1
                      }}
                    >
                      <IconButton 
                        onClick={() => handleQuantityChange(item.product._id, -1)}
                        disabled={item.quantity <= 1}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'grey.300'
                          }
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography 
                        sx={{ 
                          mx: 2,
                          fontWeight: 600,
                          minWidth: '40px',
                          textAlign: 'center'
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton 
                        onClick={() => handleQuantityChange(item.product._id, 1)}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleRemoveItem(item.product._id)}
                        sx={{ 
                          ml: 'auto',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
        <Card 
            sx={{ 
            // position: 'sticky',
            top: 24,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            bgcolor: 'background.paper',
            transition: 'box-shadow 0.3s ease',
            '&:hover': {
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }
            }}
        >
        <CardContent sx={{ p: 3 }}>
        <Typography 
            variant="h5" 
            gutterBottom
            sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 1
            }}
        >
            Order Summary
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 3 }}>
            <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 2,
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 1
            }}>
            <Typography color="text.secondary">Total Items:</Typography>
            <Typography fontWeight="600">{cartItems.length}</Typography>
            </Box>
            <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 2,
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 1
            }}>
            <Typography color="text.secondary">Subtotal:</Typography>
            <Typography fontWeight="600" color="primary.main">
                ₹{total.toLocaleString('en-IN')}
            </Typography>
            </Box>
        </Box>
        <Button 
          variant="contained" 
          fullWidth 
          size="large"
          onClick={handleCheckout}
          disabled={checkoutLoading}
          sx={{ 
            py: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1.1rem',
            borderRadius: 2,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 12px rgba(33, 150, 243, .4)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          {checkoutLoading ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Checkout'}
        </Button>
        </CardContent>
    </Card>
    </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;