import React, { useEffect, useRef, useState } from 'react';
import { ProductService } from '@/services/api/product.service';
import {getBenefitSet} from "@/services/utils/utils";
import ActivatingMembershipModal from "@/components/new-sale/ActivatingMembershipModal";
import {PromoCode} from "@/services/api/types";

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
  promoCode?: PromoCode | null;
  autoPayEnabled?: boolean;
  proratedAmount?: number | null; // New prop
  onError?: (error: string) => void;
  onSuccess?: (paymentData: any, additionalData?: { promoCode?: PromoCode | null; autoPayEnabled?: boolean }) => void;
  onInitialized?: () => void;
}

export function HostedPaymentForm({
                                    token,
                                    accountId,
                                    accountName,
                                    product,
                                    billingProfileId,
                                    hostedPaymentPageExternalId,
                                    promoCode,
                                    autoPayEnabled,
                                    proratedAmount, // Add to destructuring
                                    onError,
                                    onSuccess,
                                    onInitialized
                                  }: HostedPaymentFormProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const promoCodeRef = useRef(promoCode);
  const autoPayEnabledRef = useRef(autoPayEnabled);
  const initializationRef = useRef(false);

  useEffect(() => {
    promoCodeRef.current = promoCode;
    autoPayEnabledRef.current = autoPayEnabled;
  }, [promoCode, autoPayEnabled]);

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
        // Determine the amount to charge
        const paymentAmount = proratedAmount !== null && proratedAmount !== undefined
          ? proratedAmount
          : product.price;

        console.log('Initializing HPP with:', {
          accountId,
          accountName,
          productId: product.id,
          billingProfileId,
          hostedPaymentPageExternalId,
          amount: paymentAmount,
          proratedAmount,
          originalPrice: product.price,
          benefitSet: getBenefitSet(product.membershipLevel)
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
            amount: paymentAmount, // Use prorated amount if provided
            targetSelector: "#payment-form",
            apiUrl: process.env.NEXT_PUBLIC_HPP_URL,
            billingProfileId: hostedPaymentPageExternalId,
            // Optional parameters
            countryCode: "US",
            walletMode: false,
            allowEditPrice: false,
            currencyCode: "USD",
            allowSavePaymentMethods: true
          },
          {
            successCapture: async (response: any) => {
              console.log('Payment successful, creating subscription...', response);

              if (isProcessingPayment) {
                console.log('Already processing payment, skipping duplicate call');
                return;
              }

              setIsProcessingPayment(true);

              try {
                const accountProduct = await ProductService.createAccountProduct(
                  accountId,
                  product
                );

                console.log('Account product created successfully:', accountProduct);

                // Pass additional data along with payment response
                onSuccess?.(response, {
                  promoCode: promoCodeRef.current,
                  autoPayEnabled: autoPayEnabledRef.current
                });
              } catch (error) {
                console.error('Failed to create account product after payment:', error);
                onError?.('Payment was successful but subscription activation failed. Please contact support.');
              } finally {
                setIsProcessingPayment(false);
              }
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
  }, [isScriptLoaded, token, accountId, product, hostedPaymentPageExternalId, billingProfileId, proratedAmount, onError, onSuccess, onInitialized]);

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

  if (isProcessingPayment) {
    return (
      <ActivatingMembershipModal />
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