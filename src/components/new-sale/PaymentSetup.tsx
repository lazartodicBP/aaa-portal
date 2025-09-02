'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
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

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePaymentSuccess = () => {
    // Navigate to success page or next step
    router.push("/portal");
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

  // Check if account has been created
  if (!state.account || !state.account.id) {
    return (
      <div className="text-center">
        <Alert variant="error" message="Please create an account first" />
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
          className="mt-4"
        >
          Back to Account Creation
        </Button>
      </div>
    );
  }

  // Check if billing profile has been created
  if (!state.billingProfile || !state.billingProfile.id) {
    return (
      <div className="text-center">
        <Alert variant="error" message="Please complete billing information first" />
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
          className="mt-4"
        >
          Back to Account Creation
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
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
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

      {/* Account Info Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Account Information</h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Account Name:</span> {state.account.name}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Account ID:</span> {state.account.id}
        </p>
        {state.billingProfile && (
          <>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Billing Email:</span> {state.billingProfile.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Bill To:</span> {state.billingProfile.billTo}
            </p>
          </>
        )}
      </div>

      {/* HPP Form Container - Show immediately after account creation */}
      <HostedPaymentForm
        token={token}
        accountId={state.account.id}
        accountName={state.account.name}
        product={state.selectedProduct}
        billingProfileId={state.billingProfile.id}
        hostedPaymentPageExternalId={state.billingProfile.hostedPaymentPageExternalId}
        onError={handlePaymentError}
        onSuccess={handlePaymentSuccess}
      />

      {/* Back Button */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account Details
        </Button>
      </div>
    </div>
  );
}