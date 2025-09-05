'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Tag, CheckCircle } from 'lucide-react';
import { PromoService } from '@/services/api/promo.service';
import { PromoCode } from '@/services/api/types';
import { useSale } from '@/context/SaleContext';

interface PromoCodeInputProps {
  onError?: (error: string | null) => void;
}

export function PromoCodeInput({ onError }: PromoCodeInputProps) {
  const { state, dispatch } = useSale();
  const [promoCode, setPromoCode] = useState(state.promoCode || '');
  const [validPromo, setValidPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([]);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      const promos = await PromoService.getAvailablePromoCodes();
      setAvailablePromos(promos.filter(p => p.aaa_Promo_Code_Status === 'ACTIVE'));
    } catch (error) {
      console.error('Failed to load promo codes:', error);
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      dispatch({ type: 'SET_PROMO_CODE', payload: null });
      setValidPromo(null);
      onError?.(null);
      return;
    }

    setLoading(true);
    try {
      const promo = availablePromos.find(
        p => p.aaa_Promo_Code.toUpperCase() === promoCode.toUpperCase()
      );

      if (promo) {
        setValidPromo(promo);
        dispatch({ type: 'SET_PROMO_CODE', payload: promo.aaa_Promo_Code });

        // Check if promo requires autopay
        if (promo.requiresAutopay && state.paymentMethod !== 'autopay') {
          onError?.(`Promo code "${promo.aaa_Promo_Code}" requires automatic payment`);
        } else {
          onError?.(null);
        }
      } else {
        setValidPromo(null);
        dispatch({ type: 'SET_PROMO_CODE', payload: null });
        onError?.('Invalid promo code');
      }
    } catch (error) {
      onError?.('Failed to validate promo code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            leftIcon={<Tag className="w-4 h-4" />}
            onKeyPress={(e) => e.key === 'Enter' && validatePromoCode()}
          />
        </div>
        <Button
          variant="outline"
          onClick={validatePromoCode}
          loading={loading}
        >
          Apply
        </Button>
      </div>

      {validPromo && (
        <div className="flex items-start space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-medium">{validPromo.aaa_Promo_Code_Name}</p>
            <p className="text-sm">{validPromo.aaa_Promo_Code_Description}</p>
          </div>
        </div>
      )}

      {/* Example promo codes for testing */}
      <div className="text-xs text-gray-500">
        <p>Example codes: AUTOPAY50, WELCOME25</p>
      </div>
    </div>
  );
}