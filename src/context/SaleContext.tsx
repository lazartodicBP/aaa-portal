'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface SaleState {
  customer: Customer;
  selectedProduct: any;
  promoCode: string | null;
  paymentMethod: 'onetime' | 'autopay';
  step: number;
}

type Action =
  | { type: 'SET_CUSTOMER'; payload: Customer }
  | { type: 'SET_PRODUCT'; payload: any }
  | { type: 'SET_PROMO_CODE'; payload: string | null }
  | { type: 'SET_PAYMENT_METHOD'; payload: 'onetime' | 'autopay' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESET' };

const initialState: SaleState = {
  customer: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
  },
  selectedProduct: null,
  promoCode: null,
  paymentMethod: 'onetime',
  step: 1,
};

const SaleContext = createContext<{
  state: SaleState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function saleReducer(state: SaleState, action: Action): SaleState {
  switch (action.type) {
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    case 'SET_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    case 'SET_PROMO_CODE':
      return { ...state, promoCode: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function SaleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(saleReducer, initialState);

  return (
    <SaleContext.Provider value={{ state, dispatch }}>
      {children}
    </SaleContext.Provider>
  );
}

export function useSale() {
  const context = useContext(SaleContext);
  if (!context) {
    throw new Error('useSale must be used within a SaleProvider');
  }
  return context;
}