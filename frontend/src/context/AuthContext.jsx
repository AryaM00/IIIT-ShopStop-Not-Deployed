import { createContext, useReducer, useEffect, useState } from 'react';
export const AuthContext = createContext();
export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                user: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
            };
        default:
            return state;
        }
}
export const AuthContextProvider = ({ children }) => {
    // console.log('AuthContextProvider ran');
    const [state, dispatch] = useReducer(authReducer, {
      user: JSON.parse(localStorage.getItem('user')) || null,
    });
  
    useEffect(() => {
      const user2 = localStorage.getItem('user');
      if (user2) {
        dispatch({ type: 'LOGIN', payload: JSON.parse(user2) });
      }
    }, []);
  
    console.log('AuthContext state', state);
    return (
      <AuthContext.Provider value={{ ...state, dispatch }}>
        {children}
      </AuthContext.Provider>
    );
  };
  