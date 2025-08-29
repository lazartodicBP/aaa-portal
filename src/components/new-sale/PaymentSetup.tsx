'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useSale } from '@/context/SaleContext';
import { HPPService } from '@/services/api/hpp.service';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    HostedPayments: any;
  }
}

export function PaymentSetup() {
  const { state, dispatch } = useSale();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // First effect: Load token
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

  // Second effect: Initialize HPP when token is available and DOM is ready
  useEffect(() => {
    if (!token || loading) {
      return;
    }

    // Small delay to ensure DOM is fully rendered
    const initTimer = setTimeout(() => {
      const container = document.querySelector('#payment-form');
      if (!container) {
        console.error('Payment form container not found in DOM');
        return;
      }

      // Check if script is already loaded
      if (!window.HostedPayments) {
        // Load script dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.aws.billingplatform.com/hosted-payments-ui@release/lib.js';
        script.async = true;

        script.onload = () => {
          console.log('HPP script loaded');
          initializeHPP(token);
        };

        script.onerror = () => {
          console.error('Failed to load HPP script');
          setError('Failed to load payment system');
        };

        document.body.appendChild(script);
      } else {
        // Script already loaded, just initialize
        initializeHPP(token);
      }
    }, 100); // 100ms delay to ensure React has completed rendering

    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      const container = document.querySelector('#payment-form');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [token, loading, state.selectedProduct]); // Re-run when token changes or loading completes

  const initializeHPP = (hppToken: string) => {
    if (!window.HostedPayments || !state.selectedProduct) {
      console.error('Missing requirements:', {
        HostedPayments: !!window.HostedPayments,
        selectedProduct: !!state.selectedProduct
      });
      return;
    }

    // Verify container exists
    const container = document.querySelector('#payment-form');
    if (!container) {
      console.error('Payment form container not found during initialization');
      return;
    }

    // Clear any existing content
    container.innerHTML = '';

    // Prepare the account request as JSON string
    const accountRequest = JSON.stringify({
      name: `AAA_Member_${Date.now()}`,
      description: `AAA ${state.selectedProduct.membershipLevel} Membership`,
      additionalFields: [
        {
          key: "MembershipType",
          value: state.selectedProduct.membershipLevel
        },
        {
          key: "ProductId",
          value: state.selectedProduct.id
        }
      ],
      billingProfileRequest: {
        additionalFields: [
          {
            key: "CurrencyCode",
            value: "USD"
          },
          {
            key: "BillTo",
            value: "AAA Member"
          },
          {
            key: "Address1",
            value: "1234 Main St"
          }
        ]
      }
    });

    console.log('Initializing HPP with:', {
      token: hppToken.substring(0, 20) + '...',
      environmentId: process.env.NEXT_PUBLIC_BP_ENV_ID,
      amount: state.selectedProduct.price,
      apiUrl: process.env.NEXT_PUBLIC_HPP_URL,
      containerExists: !!document.querySelector('#payment-form')
    });

    try {
      window.HostedPayments.renderPaymentForm(
        {
          containerWidth: '100%',
          minContainerWidth: '410px',
          maxContainerWidth: '100%',
          // Required parameters
          securityToken: hppToken,
          environmentId: process.env.NEXT_PUBLIC_BP_ENV_ID,
          paymentGateways: {
            creditCard: {
              gateway: "Adyen_CC"
            },
            directDebit: {
              gateway: "Adyen_DD"
            }
          },
          amount: state.selectedProduct.price,
          targetSelector: "#payment-form",
          apiUrl: process.env.NEXT_PUBLIC_HPP_URL,
          accountRequest: accountRequest,
          // Optional parameters
          countryCode: "US",
          walletMode: false,
          allowEditPrice: false,
          currencyCode: "USD"
        },
        {
          successCapture: () => router.push("/portal"),
          addPaymentMethod: () => router.push("/portal"),
          error: (err: Error) => {
            console.warn("HPP bootstrap error:", err.message);
          }
        }
      );
      console.log('HPP initialization complete');
    } catch (err) {
      console.error('Failed to initialize HPP:', err);
      setError('Failed to initialize payment form');
    }
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
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Selected Membership</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{state.selectedProduct.name}</p>
            <p className="text-sm text-gray-600">{state.selectedProduct.displayName}</p>
          </div>
          <span className="font-bold text-lg">{state.selectedProduct.rate}/month</span>
        </div>
      </div>

      {/* HPP Form Container */}
      <div id="payment-form" className="bg-white p-6 rounded-lg shadow-md min-h-[400px]" />

      {/* Back Button */}
      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Membership Selection
        </Button>
      </div>
    </div>
  );
}