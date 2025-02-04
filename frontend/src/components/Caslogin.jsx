import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';

const CasLogin = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');

    if (encodedData) {
      try {
        const responseData = JSON.parse(decodeURIComponent(encodedData));
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(responseData));
        
        // Update auth context
        dispatch({ type: 'LOGIN', payload: responseData });
        
        // Redirect to profile
        navigate('/profile');
      } catch (error) {
        console.error('Failed to process login data:', error);
        navigate('/login');
      }
    }
  }, [navigate, dispatch]);

  return null;
};

export default CasLogin;