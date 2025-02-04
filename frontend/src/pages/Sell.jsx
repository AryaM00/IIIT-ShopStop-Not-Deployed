import React, { useState } from 'react';
import { Box } from '@mui/material';
import VerticalNavbar from '../components/VerticalNavbarProducts';
import AddProductForm from '../components/AddProductForm';
import SoldProducts from '../components/SoldProducts';
import PendingProducts from '../components/PendingProducts';

const Sell = () => {
  const [activeTab, setActiveTab] = useState('add'); // Set default to 'add'

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddProductForm />;
      case 'sold':
        return <SoldProducts />;
      case 'pending':
        return <PendingProducts />;
      default:
        return <AddProductForm />;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <VerticalNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      <Box sx={{ 
        flexGrow: 1, 
        padding: 0,
        marginLeft: '240px',
        marginTop: '0'
      }}>
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Sell;