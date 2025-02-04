import React from 'react'
import { Box } from '@mui/material';
import VerticalNavbar from '../components/VerticalNavbarProducts';
import AddProductForm from '../components/AddProductForm';
const AddProduct = () => {
  return (
    <Box sx={{ display: 'flex' }}>
    <VerticalNavbar />
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <AddProductForm />
    </Box>
    </Box>
  )
}

export default AddProduct