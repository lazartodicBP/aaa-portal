'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { PromoCodeInput } from './PromoCodeInput';
import { useSale } from '@/context/SaleContext';
import { AccountService } from '@/services/api/account.service';
import { PromoService } from "@/services/api/promo.service";
import {CreditCard, Calendar, CheckCircle} from 'lucide-react';

export function PaymentSetup() {
  const { state, dispatch } = useSale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const handlePaymentMethodChange = (method: 'onetime' | 'autopay') => {
    dispatch({ type: 'SET_PAYMENT_METHOD', payload: method });

    // Check if promo code requires autopay
    if (state.promoCode && method === 'onetime') {
      // In real app, check promo requirements
      setPromoError('Selected promo code requires automatic payment');
    } else {
      setPromoError(null);
    }
  };

  const handleSubmit = async () => {
    if (promoError) {
      setError('Please enable automatic payment to use the selected promo code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create account
      const account = await AccountService.createAccount({
        name: `${state.customer.firstName} ${state.customer.lastName}`,
        status: 'ACTIVE',
        accountTypeId: 'INDIVIDUAL',
      });

      // Create billing profile
      const billingProfile = await AccountService.createBillingProfile({
        accountId: account.id!,
        billTo: `${state.customer.firstName} ${state.customer.lastName}`,
        address1: state.customer.address.street,
        city: state.customer.address.city,
        state: state.customer.address.state,
        zip: state.customer.address.zip,
        country: 'US',
        email: state.customer.email,
        currencyCode: 'USD',
        billingCycle: state.selectedProduct.billingCycle,
        paymentTermDays: 30,
        billingMethod: 'EMAIL',
        invoiceDeliveryMethod: 'EMAIL',
      });

      // Create account product
      const accountProduct = await AccountService.createAccountProduct({
        accountId: account.id!,
        productId: state.selectedProduct.id,
        quantity: 1,
        startDate: new Date().toISOString(),
        status: 'ACTIVE',
      });

      // Apply promo code if present
      if (state.promoCode) {
        await PromoService.addAccountPromoCode(account.id!, state.promoCode);
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to complete membership setup');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#004B87] mb-2">
            Membership Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome {state.customer.firstName} to AAA {state.selectedProduct.membershipLevel}!
          </p>
          <Button
            variant="primary"
            onClick={() => {
              dispatch({ type: 'RESET' });
              dispatch({ type: 'SET_STEP', payload: 1 });
            }}
          >
            Create Another Membership
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-[#004B87]">Payment Setup</h2>

      {error && <Alert variant="error" message={error} />}

      {/* Payment Method Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

          <div className="space-y-3">
            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="onetime"
                checked={state.paymentMethod === 'onetime'}
                onChange={() => handlePaymentMethodChange('onetime')}
                className="mt-1"
              />
              <div className="ml-3">
                <div className="font-medium flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  One-Time Payment
                </div>
                <p className="text-sm text-gray-600">
                  Pay for your membership manually when due
                </p>
              </div>
            </label>

            <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="autopay"
                checked={state.paymentMethod === 'autopay'}
                onChange={() => handlePaymentMethodChange('autopay')}
                className="mt-1"
              />
              <div className="ml-3">
                <div className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Automatic Payment
                </div>
                <p className="text-sm text-gray-600">
                  Automatically renew your membership
                </p>
                {state.promoCode && (
                  <p className="text-sm text-green-600 mt-1">
                    Required for promo code discount
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      </Card>

      {/* Promo Code */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Promo Code</h3>
          <PromoCodeInput onError={setPromoError} />
          {promoError && (
            <Alert variant="warning" message={promoError} className="mt-2" />
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Membership:</span>
              <span className="font-medium">
                {state.selectedProduct?.name || 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-medium">
                ${state.selectedProduct?.price || 0}
                {state.selectedProduct?.billingCycle === 'MONTHLY' ? '/month' : '/year'}
              </span>
            </div>
            {state.promoCode && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span className="font-medium">-50%</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>
                  ${state.selectedProduct?.price ?
                  (state.promoCode ? state.selectedProduct.price * 0.5 : state.selectedProduct.price) : 0}
                  {state.selectedProduct?.billingCycle === 'MONTHLY' ? '/month' : '/year'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          Complete Membership
        </Button>
      </div>
    </div>
  );
}