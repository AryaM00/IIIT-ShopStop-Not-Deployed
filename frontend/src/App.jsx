// Desc: Main App component
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CssBaseline, GlobalStyles } from '@mui/material'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Products from './pages/Products'
import Signup from './pages/Signup'
import Login from './pages/login'
import Sell from './pages/Sell'
import Profile from './pages/Profile'
import Support from './pages/Support'
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart'
import Order from './pages/Order' 
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import CasLogin from './components/Caslogin'
import SellerDetail from './pages/SellerDetail'
const globalStyles = {
  body: {
    overflowY: 'scroll', // Always show vertical scrollbar
    margin: 0, // Remove default margin
    padding: 0, // Remove default padding
    boxSizing: 'border-box', // Ensure padding and border are included in the element's total width and height
  },
  '*::-webkit-scrollbar': {
    width: '8px',
  },
  '*::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '*::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  '*::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
};

function App() {

  return (
    <div className='App'>
      <BrowserRouter>
        <CssBaseline />
        <GlobalStyles styles={globalStyles} />
        <Navbar />
        <div className="pages">
          <Routes>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/caslogin" element={<CasLogin/>}/>

            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }/>
            <Route path="/products" element={
              <ProtectedRoute>
                <Products/>
              </ProtectedRoute>
            }/>
            <Route path="/product/:id" element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }/>
            <Route path="/seller/:id" element={
              <ProtectedRoute>
                <SellerDetail />
              </ProtectedRoute>
            }/>
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile/>
              </ProtectedRoute>
            }/>
            <Route path='/sell' element={
              <ProtectedRoute>
                <Sell/>
              </ProtectedRoute>
            }/>
            <Route path='/support' element={
              <ProtectedRoute>
                <Support/>
              </ProtectedRoute>
            }/>
            <Route path='/cart' element={
              <ProtectedRoute>
                <Cart/>
              </ProtectedRoute>
            }/>
            <Route path='/myorders' element={
              <ProtectedRoute>
                <Order/>
              </ProtectedRoute>
            }/>
            <Route path="*" element={<NotFound />} />
  


          </Routes>
        </div>
      </BrowserRouter>




    </div>
  )
}

export default App
