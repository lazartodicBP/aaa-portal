'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface SaleState {
  selectedProduct: any;
  promoCode: string | null;
  step: number;
}

type Action =
  | { type: 'SET_PRODUCT'; payload: any }
  | { type: 'SET_PROMO_CODE'; payload: string | null }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESET' };

const initialState: SaleState = {
  selectedProduct: null,
  promoCode: null,
  step: 1,
};

const SaleContext = createContext<{
  state: SaleState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function saleReducer(state: SaleState, action: Action): SaleState {
  switch (action.type) {
    case 'SET_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    case 'SET_PROMO_CODE':
      return { ...state, promoCode: action.payload };
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