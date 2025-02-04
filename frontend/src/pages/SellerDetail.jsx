import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Rating,
  Button,
  TextField,
  Box,
  Avatar,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import StarIcon from '@mui/icons-material/Star';

const SellerDetail = () => {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${id}`);
        const data = await response.json();
        if (response.ok) {
          setSeller(data);
        } else {
          throw new Error(data.error);
        }
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch seller information');
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  const handleSubmitReview = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/reviews/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          reviewerId: user.user._id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSeller({
          ...seller,
          sellerReviews: [...seller.sellerReviews, data]
        });
        setSnackbar({ open: true, message: 'Review submitted successfully!', severity: 'success' });
        setOpenReviewDialog(false);
        setReviewRating(0);
        setReviewComment('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  };

  if (loading) return <Typography align="center" sx={{ mt: 4 }}>Loading...</Typography>;
  if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Seller Info Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {seller?.firstName} {seller?.lastName}
                </Typography>
                <Rating 
                  value={seller?.averageRating || 0} 
                  readOnly 
                  precision={0.5}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {seller?.totalReviews || 0} reviews
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>{seller?.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography>{seller?.contactNumber || 'Not provided'}</Typography>
              </Box>
              {user && user.user._id !== id && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setOpenReviewDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Write a Review
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1, color: 'primary.main' }} />
              Reviews ({seller?.sellerReviews?.length || 0})
            </Typography>
            <Box sx={{ mb: 3 }}>
              {seller?.sellerReviews?.map((review, index) => (
                <Card key={index} sx={{ 
                  mb: 2, 
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        by {review.reviewer?.firstName} {review.reviewer?.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ ml: 'auto', color: 'text.secondary' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>{review.comment}</Typography>
                  </CardContent>
                </Card>
              ))}
              {(!seller?.sellerReviews || seller.sellerReviews.length === 0) && (
                <Typography color="text.secondary" align="center">
                  No reviews yet
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Rating
              value={reviewRating}
              onChange={(event, newValue) => setReviewRating(newValue)}
              precision={0.5}
            />
            <TextField
              multiline
              rows={4}
              variant="outlined"
              label="Your Review"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitReview} 
            variant="contained"
            disabled={!reviewRating || !reviewComment}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SellerDetail;