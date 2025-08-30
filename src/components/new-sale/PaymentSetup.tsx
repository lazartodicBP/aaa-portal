'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AccountNameForm } from './AccountNameForm';
import { MembershipSummary } from './MembershipSummary';
import { HostedPaymentForm } from './HostedPaymentForm';
import { useSale } from '@/context/SaleContext';
import { HPPService } from '@/services/api/hpp.service';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PaymentSetup() {
  const { state, dispatch } = useSale();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isHPPInitialized, setIsHPPInitialized] = useState(false);

  // Load token
  useEffect(() => {
    // Clear any cached token to force re-authentication
    HPPService.clearToken();

    const loadToken = async () => {
      try {
        const hppToken = await HPPService.getSecurityToken();
        if (!hppToken) {
          setError('Failed to initialize payment system');
        } else {
          setToken(hppToken);
        }
      } catch (err) {
        console.error('Error loading token:', err);
        setError('Payment system error');
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const handleContinueToPayment = () => {
    // Validate account name
    if (!accountName.trim()) {
      setNameError('Please enter an account name');
      return;
    }

    if (accountName.trim().length < 2) {
      setNameError('Account name must be at least 2 characters');
      return;
    }

    // Clear any previous errors
    setNameError(null);

    // Initialize HPP
    setIsHPPInitialized(true);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    // Optionally reset the form
    // setIsHPPInitialized(false);
  };

  const handlePaymentSuccess = () => {
    // Navigate to success page or next step
    router.push("/portal");
  };

  const handleReset = () => {
    setIsHPPInitialized(false);
    setAccountName('');
    setError(null);
  };

  if (!state.selectedProduct) {
    return (
      <div className="text-center">
        <Alert variant="error" message="No membership selected" />
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          className="mt-4"
        >
          Back to Membership Selection
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aaa-blue"></div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div>
        <Alert variant="error" message={error || 'Payment system unavailable'} />
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-aaa-blue mb-6">
        Complete Your {state.selectedProduct.membershipLevel} Membership
      </h2>

      {/* Selected Membership Summary */}
      <MembershipSummary product={state.selectedProduct} />

      {/* Account Name Form */}
      {!isHPPInitialized && (
        <AccountNameForm
          accountName={accountName}
          setAccountName={setAccountName}
          nameError={nameError}
          setNameError={setNameError}
          onContinue={handleContinueToPayment}
        />
      )}

      {/* HPP Form Container - Only show after account name is provided */}
      {isHPPInitialized && token && (
        <HostedPaymentForm
          token={token}
          accountName={accountName}
          product={state.selectedProduct}
          onError={handlePaymentError}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => {
            if (isHPPInitialized) {
              // Reset the form if HPP was initialized
              handleReset();
            } else {
              // Go back to membership selection
              dispatch({ type: 'SET_STEP', payload: 1 });
            }
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isHPPInitialized ? 'Back to Account Information' : 'Back to Membership Selection'}
        </Button>
      </div>
    </div>
  );
}