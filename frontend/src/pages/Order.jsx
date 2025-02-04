import React, { useState } from 'react';
import { Box } from '@mui/material';
import OrderNavbar from '../components/OrderNavbar';
import OrderCompleted from '../components/OrderCompleted';
import OrderPending from '../components/OrderPending';

const Order = () => {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: 'calc(100vh - 64px)',
    }}>
      <OrderNavbar activeTab={activeTab} onTabChange={setActiveTab} />
      <Box sx={{ 
        flexGrow: 1, 
        marginLeft: '240px',

      }}>
        {activeTab === 'completed' ? (
          <OrderCompleted />
        ) : (
          <OrderPending />
        )}
      </Box>
    </Box>
  );
};

export default Order;