import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import logo from '../assets/logo.webp';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';


const Navbar = ({ userId }) => {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  }
  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#2c3e50' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" className="logo">
            <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto' }} />
          </Link>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 2 }}>
        {user ? (
    <>
      <Button component={Link} to="/products" sx={navButtonStyles}>
        Products
      </Button>
      <Button component={Link} to="/sell" sx={navButtonStyles}>
        Sell
      </Button>
      <Button component={Link} to={`/myorders`} sx={navButtonStyles}>
        My Orders
      </Button>
      <Button component={Link} to={`/support`} sx={navButtonStyles}>
        Support
      </Button>
      <Button component={Link} to={`/profile`} sx={navButtonStyles}>
        Profile
      </Button>
      <IconButton component={Link} to="/cart" sx={{ color: '#ecf0f1' }}>
        <ShoppingCartIcon />
      </IconButton>
      <Button component={Link} to="/logout" onClick={handleLogout} sx={navButtonStyles}>
        Logout
      </Button>

    </>
  ) : (
    <>
      <Button component={Link} to="/login" sx={navButtonStyles}>
        Login
      </Button>
      <Button component={Link} to="/signup" sx={navButtonStyles}>
        Signup
      </Button>
    </>
  )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Custom styles for buttons
const navButtonStyles = {
  color: '#ecf0f1', 
  textDecoration: 'none',
  '&:hover': {
    backgroundColor: '#34495e', // Hover effect
    color: '#fff',
    borderRadius: '4px',
  },
  '&.active': {
    fontWeight: 'bold',
    borderBottom: '2px solid #ecf0f1',
  }
};

export default Navbar;
