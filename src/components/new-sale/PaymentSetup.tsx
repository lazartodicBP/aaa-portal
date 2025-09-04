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
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <h2 className="text-2xl font-bold text-aaa-blue mb-6 text-center">
        Complete Your {state.selectedProduct.membershipLevel} Membership Purchase
      </h2>

      {/* Side by Side Layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column - Membership Summary */}
        <div className="lg:sticky lg:top-4 h-fit">
          <MembershipSummary
            product={state.selectedProduct}
            promoCode={state.promoCode || undefined}
            discountPercent={state.discountPercent}
          />

          {/* Account Info Summary - Moved below membership summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold mb-3 text-gray-900">Account Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{state.account.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Member Type:</span>
                <span className="font-medium">{state.account.aaa_MemberAcctType || 'Primary'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Member ID:</span>
                <span className="font-mono text-xs">{state.account.aaa_MemberID || state.account.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Form */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Payment Form Header */}
            <div className="bg-gray-50 px-5 py-4 border-b">
              <h3 className="font-semibold text-lg text-gray-900">Payment Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter your payment details to complete your membership purchase
              </p>
            </div>

            {/* Hosted Payment Form */}
            <div className="p-5">
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
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-900">
                <p className="font-medium">Secure Payment Processing</p>
                <p className="text-blue-700 mt-1">
                  Your payment information is encrypted and processed securely through our PCI-compliant payment system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button - Full width at bottom */}
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'RESET'})}
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Account Details
        </Button>
      </div>
    </div>
  );
}