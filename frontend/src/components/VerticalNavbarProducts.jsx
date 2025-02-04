import React from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';

const VerticalNavbar = ({ activeTab, onTabChange }) => {
  return (
    <Box 
      sx={{ 
        width: '240px', 
        borderRight: '2px solid',
        borderColor: 'primary.light',
        height: 'calc(100vh - 64px)',
        backgroundColor: '#ffffff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 64,
        left: 0,
        zIndex: 1000,
        overflowY: 'hidden'   
      }}
    >
      <List sx={{ 
        padding: '20px 0px',
        '& .MuiListItem-root': {
          mb: 1,
          mx: 0,
        }
      }}>
        <ListItem 
          button 
          onClick={() => onTabChange('add')}
          sx={{ 
            mx: 0,
            backgroundColor: activeTab === 'add' ? 'primary.light' : 'inherit',
            color: activeTab === 'add' ? 'primary.main' : 'text.primary',
            '&:hover': { 
              backgroundColor: 'primary.light',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <ListItemIcon>
            <AddCircleIcon color={activeTab === 'add' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText 
            primary="Add Product" 
            primaryTypographyProps={{
              fontWeight: activeTab === 'add' ? 600 : 400
            }}
          />
        </ListItem>

        <ListItem 
          button 
          onClick={() => onTabChange('sold')}
          sx={{ 
            backgroundColor: activeTab === 'sold' ? 'primary.light' : 'inherit',
            color: activeTab === 'sold' ? 'primary.main' : 'text.primary',
            '&:hover': { 
              backgroundColor: 'primary.light',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <ListItemIcon>
            <CheckCircleIcon color={activeTab === 'sold' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText 
            primary="Sold" 
            primaryTypographyProps={{
              fontWeight: activeTab === 'sold' ? 600 : 400
            }}
          />
        </ListItem>

        <ListItem 
          button 
          onClick={() => onTabChange('pending')}
          sx={{ 
            backgroundColor: activeTab === 'pending' ? 'primary.light' : 'inherit',
            color: activeTab === 'pending' ? 'primary.main' : 'text.primary',
            '&:hover': { 
              backgroundColor: 'primary.light',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <ListItemIcon>
            <PendingIcon color={activeTab === 'pending' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText 
            primary="Pending" 
            primaryTypographyProps={{
              fontWeight: activeTab === 'pending' ? 600 : 400
            }}
          />
        </ListItem>
      </List>
    </Box>
  );
};

export default VerticalNavbar;