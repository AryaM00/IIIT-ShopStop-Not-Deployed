import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Modal,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid2,
  CircularProgress,
  Chip
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuthContext } from '../hooks/useAuthContext';
import {io}from 'socket.io-client';

const OrderPending = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [newOTP, setNewOTP] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { user } = useAuthContext();
  const fetchPendingOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/buyer/pending/${user.user._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  useEffect(() => {


    fetchPendingOrders();
  }, [user]);

  const handleGenerateOTP = async (orderId) => {
    try {
      setSelectedOrderId(orderId);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/generate-otp/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        setNewOTP(data.otp);
        setOpenModal(true);
        setSnackbar({
          open: true,
          message: 'New OTP generated successfully',
          severity: 'success'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };
    if (loading) {
        return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
        </Box>
        );
    }

    if (error) {
        return (
        <Alert severity="error" sx={{ m: 2 }}>
            {error}
        </Alert>
        );
    }

    if (!orders.length) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
            p: 3,
            backgroundColor: '#fff'
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
                fontWeight: 500,
                textAlign: 'center',
                py: 2
              },
              animation: 'fadeIn 0.5s ease-in',
              '@keyframes fadeIn': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(10px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
              No Pending Orders
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your orders will appear here once you make a purchase
            </Typography>
          </Alert>
        </Box>
      );
    }

    return (
        
        <Box sx={{ p: 3 }}>
          <Grid2 container spacing={3}>
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
      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 2,
                        mt: 2 
                      }}>
                        <Chip label="Pending" color="warning" size="small" />
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RefreshIcon />}
                          onClick={() => handleGenerateOTP(order._id)}
                        >
                          Generate OTP
                        </Button>
                      </Box>
      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Ordered on: {new Date(order.createdAt).toLocaleDateString()}

                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Order ID: {order._id}

                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Grid2>
            ))}
          </Grid2>
      
          <Dialog
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="otp-dialog"
          >
            <DialogTitle>
              New OTP Generated
            </DialogTitle>
            <DialogContent>
              <Box sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1
              }}>
                <Typography variant="h4" sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: 4,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  {newOTP}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
      
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      );
};

export default OrderPending;