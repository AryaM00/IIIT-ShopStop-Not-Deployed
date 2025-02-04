import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Chip,
  Stack,
  IconButton

} from '@mui/material';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from 'axios';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
// circular process and process
import CircularProgress from '@mui/material/CircularProgress';
import process from 'dotenv';




const AddProductForm = () => {
  const { user } = useAuthContext().user;
  // console.log('User:', user);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const categories = ['clothing', 'grocery', 'electronics', 'furniture', 'other'];
  const [uploading, setUploading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl('');
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });
  const handleCategoryClick = (selectedCategory) => {
    if (category === selectedCategory) {
      // If clicking the same category, deselect it
      setCategory('');
    } else {
      // Select the new category
      setCategory(selectedCategory);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
      
    let uploadedImageUrl = '';
    if (imageFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  
      try {
        const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        uploadedImageUrl = uploadResponse.data.secure_url;
        
        // After successful upload, create product
        const newProduct = {
          name,
          price,
          description,
          category,
          imageUrl: uploadedImageUrl,
          sellerId: user._id
        };
        console.log('New product:', newProduct);
  
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProduct),
        });
        const data = await response.json();
        console.log('Response:', response);

        if (response.ok) {
          // Reset form
          setName('');
          setPrice('');
          setDescription('');
          setCategory('');
          setImageFile(null);
          setImageUrl('');
          setAlertSeverity('success');
          setAlertMessage('Product added successfully!');
          setOpenSnackbar(true);
        } else {
          throw new Error(data.error || 'Failed to add product');
        }
  
      } catch (error) {
        console.error('Error:', error);
        setAlertSeverity('error');
        setAlertMessage(error.message || 'Failed to add product');
        setOpenSnackbar(true);
      } finally {
        setUploading(false);
      }
    }
  };
  {imageUrl && (
    <Box sx={{ position: 'relative', mt: 2 }}>
      {/* ...existing image preview code... */}
      {uploading && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Uploading image...
          </Typography>
        </Box>
      )}
    </Box>
  )}

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 3,
      maxWidth: 600,
      mx: 'auto',
      p: 3
    }}>
      <TextField
        label="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        sx={{ bgcolor: 'background.paper' }}
      />
      <TextField
        label="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
        sx={{ bgcolor: 'background.paper' }}
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={4}
        required
        sx={{ bgcolor: 'background.paper' }}
      />
         <Box sx={{ my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Select Category (click to toggle):
        </Typography>
        <Stack 
          direction="row" 
          spacing={1} 
          useFlexGap 
          flexWrap="wrap" 
          sx={{ gap: 1 }}
        >
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              onClick={() => handleCategoryClick(cat)}
              color={category === cat ? 'primary' : 'default'}
              variant={category === cat ? 'filled' : 'outlined'}
              sx={{
                textTransform: 'capitalize',
                fontSize: '0.9rem',
                py: 2.5,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: category === cat ? 'primary.light' : 'action.hover',
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
                transition: 'all 0.2s ease',
                animation: category === cat ? 'selectPop 0.3s ease' : 'none',
                '@keyframes selectPop': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            />
          ))}
        </Stack>
      </Box>

      <Paper
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the image here' : 'Drag & drop an image here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to select a file
        </Typography>
      </Paper>

      {imageUrl && (
        <Box 
          sx={{
            position: 'relative',
            mt: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}
        >
          <IconButton
            onClick={handleRemoveImage}
            sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
              zIndex: 1,
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box
            component="img"
            src={imageUrl}
            alt="Preview"
            sx={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain',
              borderRadius: 1
            }}
          />
        </Box>
      )}

      <Button 
        type="submit" 
        variant="contained" 
        color="primary"
        size="large"
        sx={{
          mt: 2,
          py: 1.5,
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: 2,
          '&:hover': {
            boxShadow: 4
          }
        }}
      >
        Add Product
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert 
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={alertSeverity}
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          {alertMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
    
  );
};

export default AddProductForm;