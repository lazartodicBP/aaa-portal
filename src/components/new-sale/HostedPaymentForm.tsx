import React, { useEffect, useRef, useState } from 'react';
import { AccountService } from '@/services/api/account.service';

declare global {
  interface Window {
    HostedPayments: any;
  }
}

interface HostedPaymentFormProps {
  token: string;
  accountName: string;
  product: any;
  onError?: (error: string) => void;
  onSuccess?: () => void;
  onInitialized?: () => void;
}

export function HostedPaymentForm({
                                    token,
                                    accountName,
                                    product,
                                    onError,
                                    onSuccess,
                                    onInitialized
                                  }: HostedPaymentFormProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [accountTypeId, setAccountTypeId] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);

  // Fetch AccountTypeId for 'Member' type
  useEffect(() => {
    const fetchAccountTypeId = async () => {
      try {
        // Get the ID for 'Member' account type
        const typeId = await AccountService.getAccountType('Member');
        setAccountTypeId(typeId || '');
      } catch (error) {
        console.error('Error fetching account type ID:', error);
        setAccountTypeId(''); // Default to empty if not found
      }
    };

    fetchAccountTypeId();
  }, []);

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
    if (!isScriptLoaded || !token || !accountName || !product || initializationRef.current || !accountTypeId) {
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

      // Prepare the account request with AccountTypeId if available
      const additionalFields = [
        {
          key: "ProductId",
          value: product.id
        },
      ];


      const accountRequest = JSON.stringify({
        name: accountName,
        description: `AAA ${product.membershipLevel} Membership`,
        additionalFields: additionalFields,
        billingProfileRequest: {
          additionalFields: [
            {
              key: "CurrencyCode",
              value: "USD"
            },
            {
              key: "BillTo",
              value: accountName
            },
            {
              key: "Address1",
              value: "1234 Main St"
            },
            {
              key: "Zip",
              value: "12345"
            },
            {
              key: "State",
              value: "AL"
            },
            {
              key: "AccountTypeId",
              value: accountTypeId
            }
          ]
        }
      });

      try {
        console.log('Initializing HPP with AccountTypeId:', accountTypeId || 'Not set');

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
            accountRequest: accountRequest,
            // Optional parameters
            countryCode: "US",
            walletMode: false,
            allowEditPrice: false,
            currencyCode: "USD"
          },
          {
            successCapture: () => {
              console.log('Payment successful');
              // onSuccess?.();
            },
            error: (error: Error) => {
              console.warn("HPP error:", error.message);
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
  }, [isScriptLoaded, token, accountName, product, accountTypeId, onError, onSuccess, onInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      initializationRef.current = false;
    };
  }, []);

  return (
    <>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Account Name:</span> {accountName}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">Membership Type:</span> {product.membershipLevel}
        </p>
      </div>
      <div
        id="payment-form"
        ref={containerRef}
        className="bg-white p-6 rounded-lg shadow-md min-h-[400px]"
      />
    </>
  );
}