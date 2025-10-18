import { useContext } from 'react';
import { ShoppingContext } from './ShoppingContextInstance';

export const useShoppingContext = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingContext must be used within a ShoppingProvider');
  }
  return context;
};
