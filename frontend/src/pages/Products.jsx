import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CircularProgress, 
  Alert, 
  CardActions, 
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  TextField,
  InputAdornment,
  Snackbar
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
const Products = () => {
  const {user} = useAuthContext().user;

  
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const categories = ['clothing', 'grocery', 'electronics', 'furniture', 'other'];
  const navigate = useNavigate(); 


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setError('Unexpected response format');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (productId) => {

    if (!user) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Please login to add items to cart');
      setOpenSnackbar(true);
      return;
    }

    try {
      const tosend={
        userId: user._id,
        productId: productId,
        quantity: 1
      }
      console.log('tosend',tosend);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
          productId: productId,
          quantity: 1
        }),
      });

      const data = await response.json();
      console.log(data);  

      if (response.ok) {
        setSnackbarSeverity('success');
        setSnackbarMessage('Added to cart successfully!');
      } else {
        throw new Error(data.error || 'Failed to add to cart');
      }
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage(error.message);
    }
    setOpenSnackbar(true);
  };
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                           selectedCategories.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  const drawerWidth = 240;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            mt: '64px',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
          },
        }}
      >
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Typography variant="h6" sx={{ 
            p: 2, 
            color: 'primary.main',
            fontWeight: 600,
            borderBottom: '2px solid',
            borderColor: 'primary.main'
          }}>
            Categories
          </Typography>
          <List>
            {categories.map((category) => (
              <ListItem key={category} disablePadding>
                <ListItemButton 
                  onClick={() => handleCategoryToggle(category)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': {
                      bgcolor: 'primary.light',
                    }
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedCategories.includes(category)}
                    sx={{
                      color: 'primary.main',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      }
                    }}
                  />
                  <ListItemText 
                    primary={category.charAt(0).toUpperCase() + category.slice(1)}
                    sx={{ ml: 1 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
  
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3, 
        mt: '64px',
        bgcolor: '#f5f5f5'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 3,
            bgcolor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
              }
            },
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
  
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                },
                cursor: 'pointer',
              }}     onClick={() => handleProductClick(product._id)}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imageUrl || 'https://via.placeholder.com/300'}
                    alt={product.name || 'Unknown'}
                    sx={{ 
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: '16px',
                      fontSize: '0.875rem',
                      fontWeight: 'medium',
                      textTransform: 'capitalize',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {product.category}
                  </Typography>
                </Box>
  
                <CardContent sx={{ 
                  flexGrow: 1,
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.3,
                      height: '2.6em'
                    }}
                  >
                    {product.name || 'Unknown'}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: '3em'
                    }}
                  >
                    {product.description || 'No description available'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 'bold',
                      display: 'inline-block',
                      position: 'relative',
                      '&::before': {
                        content: '"₹"',
                        position: 'relative',
                        top: -4,
                        left: -2,
                        fontSize: '1rem'
                      }
                    }}
                  >
                    {product.price?.toLocaleString('en-IN') || 'N/A'}
                  </Typography>
                </CardContent>
                <Box onClick={(e) => e.stopPropagation()}>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={() =>{ 
                      console.log(product._id);

                      handleAddToCart(product._id)}}
                    sx={{
                      py: 1.5,
                      textTransform: 'none',
                      borderRadius: 2,
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 10px 4px rgba(33, 150, 243, .3)',
                      }
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
                </Box>
                
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Snackbar 
          open={openSnackbar} 
          autoHideDuration={3000} 
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setOpenSnackbar(false)} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
    </Snackbar>

    </Box>
  );
};

export default Products;
