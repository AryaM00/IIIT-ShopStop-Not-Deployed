import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid2
} from '@mui/material';
import { useAuthContext } from '../hooks/useAuthContext';

const SoldProducts = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchSoldProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/seller/completed/${user.user._id}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSoldProducts();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!orders.length) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 200px)',
        p: 3
      }}>
        <Alert 
          severity="info" 
          variant="outlined"
          sx={{
            borderRadius: 2,
            width: '100%',
            maxWidth: 500,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '& .MuiAlert-icon': { fontSize: '2rem' },
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              fontWeight: 500
            }
          }}
        >
          No products sold yet
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid2 container spacing={3} sx={{ maxWidth: '1800px', margin: '0 auto' }}>
        {orders.map((order) => (
          <Grid2 xs={12} md={6} key={order._id}>
            <Card sx={{ 
              display: 'flex',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
              height: '100%',
            }}>
              <Box sx={{ width: '35%', position: 'relative' }}>
                <img
                  src={order.productId?.imageUrl || '/placeholder.png'}
                  alt={order.productId?.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
              <Box sx={{ width: '65%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {order.productId?.name || 'Product Name'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Quantity: {order.quantity}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{order.totalAmount}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label="Delivered" 
                      color="success"
                      size="small"
                    />
                  </Box>

                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 2,
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      display: 'block'
                    }}
                  >
                    Order ID: {order._id}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default SoldProducts;