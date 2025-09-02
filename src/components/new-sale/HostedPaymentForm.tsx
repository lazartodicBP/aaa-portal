import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    HostedPayments: any;
  }
}

interface HostedPaymentFormProps {
  token: string;
  accountId: string;
  accountName: string;
  product: any;
  billingProfileId?: string;
  hostedPaymentPageExternalId?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  onInitialized?: () => void;
}

export function HostedPaymentForm({
                                    token,
                                    accountId,
                                    accountName,
                                    product,
                                    billingProfileId,
                                    hostedPaymentPageExternalId,
                                    onError,
                                    onSuccess,
                                    onInitialized
                                  }: HostedPaymentFormProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);

  // Load HPP script
  useEffect(() => {
    if (window.HostedPayments) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.aws.billingplatform.com/hosted-payments-ui@release/lib.js';
    script.async = true;

    script.onload = () => {
      console.log('HPP script loaded');
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load HPP script');
      onError?.('Failed to load payment system');
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: Don't remove script as it might be used by other instances
    };
  }, [onError]);

  // Initialize HPP when script is loaded and all dependencies are ready
  useEffect(() => {
    if (!isScriptLoaded || !token || initializationRef.current) {
      console.log('HPP initialization waiting for:', {
        isScriptLoaded,
        token: !!token,
        accountId,
        product: !!product,
        alreadyInitialized: initializationRef.current
      });
      return;
    }

    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (!containerRef.current) {
        console.error('Payment form container not found');
        onError?.('Payment form container not found');
        return;
      }

      if (!window.HostedPayments) {
        console.error('HostedPayments not available');
        onError?.('Payment system not available');
        return;
      }

      // Prevent double initialization
      if (initializationRef.current) {
        return;
      }
      initializationRef.current = true;

      // Clear any existing content
      containerRef.current.innerHTML = '';

      try {
        console.log('Initializing HPP with:', {
          accountId,
          accountName,
          productId: product.id,
          billingProfileId,
          amount: product.price
        });

        window.HostedPayments.renderPaymentForm(
          {
            containerWidth: '100%',
            minContainerWidth: '410px',
            maxContainerWidth: '100%',
            // Required parameters
            securityToken: token,
            environmentId: process.env.NEXT_PUBLIC_BP_ENV_ID,
            paymentGateways: {
              creditCard: { gateway: "Adyen_CC" },
              directDebit: { gateway: "Adyen_DD" },
            },
            amount: product.price,
            targetSelector: "#payment-form",
            apiUrl: process.env.NEXT_PUBLIC_HPP_URL,
            billingProfileId: hostedPaymentPageExternalId,
            // Optional parameters
            countryCode: "US",
            walletMode: false,
            allowEditPrice: false,
            currencyCode: "USD"
          },
          {
            successCapture: (response: any) => {
              console.log('Payment successful:', response);
              // Create account product
            },
            error: (error: Error) => {
              console.error("HPP error:", error.message);
            }
          }
        );

        console.log('HPP initialization complete');
        onInitialized?.();
      } catch (err) {
        console.error('Failed to initialize HPP:', err);
        onError?.('Failed to initialize payment form');
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [isScriptLoaded, token, billingProfileId, onError, onSuccess, onInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      initializationRef.current = false;
    };
  }, []);

  if (!isScriptLoaded) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aaa-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="payment-form"
      ref={containerRef}
      className="bg-white p-6 rounded-lg shadow-md min-h-[400px]"
    />
  );
}