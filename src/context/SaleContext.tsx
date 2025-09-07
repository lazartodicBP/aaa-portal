'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Account, BillingProfile } from '@/services/api/types';

interface SaleState {
  selectedProduct: any;
  promoCode: string | null;
  step: number;
  account: Account | null;
  billingProfile: BillingProfile | null;
  discountPercent: number;
}

type Action =
  | { type: 'SET_PRODUCT'; payload: any }
  | { type: 'SET_PROMO_CODE'; payload: string | null }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_DISCOUNT_PERCENT'; payload: number }
  | { type: 'SET_ACCOUNT'; payload: Account }
  | { type: 'SET_BILLING_PROFILE'; payload: BillingProfile }
  | { type: 'SET_ACCOUNT_AND_BILLING'; payload: { account: Account; billingProfile: BillingProfile } }
  | { type: 'RESET' };

const initialState: SaleState = {
  selectedProduct: null,
  promoCode: null,
  discountPercent: 0, // Add this
  step: 1,
  account: null,
  billingProfile: null,
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
    case 'SET_ACCOUNT':
      return { ...state, account: action.payload };
    case 'SET_DISCOUNT_PERCENT':
      return { ...state, discountPercent: action.payload };
    case 'SET_BILLING_PROFILE':
      return { ...state, billingProfile: action.payload };
    case 'SET_ACCOUNT_AND_BILLING':
      return {
        ...state,
        account: action.payload.account,
        billingProfile: action.payload.billingProfile
      };
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