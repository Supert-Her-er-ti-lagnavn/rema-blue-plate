import { createContext } from 'react';
import type { ShoppingContextType } from './ShoppingContext';

export const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);
