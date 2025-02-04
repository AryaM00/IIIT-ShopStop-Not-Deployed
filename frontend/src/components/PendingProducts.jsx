import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuthContext } from '../hooks/useAuthContext';

const PendingProducts = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [otp, setOtp] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/seller/pending/${user.user._id}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [user]);

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/verify/${selectedOrder._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(orders.filter(order => order._id !== selectedOrder._id));
        setOpenDialog(false);
        setOtp('');
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!orders.length) return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 200px)',
        p: 3
      }}
    >
      <Alert 
        severity="info" 
        variant="outlined"
        sx={{
          borderRadius: 2,
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '& .MuiAlert-icon': {
            fontSize: '2rem'
          },
          '& .MuiAlert-message': {
            fontSize: '1.1rem',
            fontWeight: 500
          }
        }}
      >
        No pending orders available at the moment
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
    <Grid2 container spacing={3} sx={{ maxWidth: '1800px', margin: '0 auto' }}>
      {orders.map((order) => (
        <Grid2 xs={14} md={6} key={order._id}>
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
            <Box sx={{ 
              width: '60%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ 
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {order.productId?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {order.quantity}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    ₹{order.totalAmount}
                  </Typography>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip label="Pending" color="warning" size="small" />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setSelectedOrder(order);
                        setOpenDialog(true);
                      }}
                    >
                      Confirm Delivery
                    </Button>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Order ID: {order._id}

                </Typography>
              </CardContent>
            </Box>
          </Card>
        </Grid2>
      ))}
    </Grid2>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Verify Delivery OTP</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter OTP"
            type="text"
            fullWidth
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyOTP} variant="contained">
            Verify & Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PendingProducts;