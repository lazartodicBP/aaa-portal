'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { HostedPaymentForm } from '@/components/new-sale/HostedPaymentForm';
import { HPPService } from '@/services/api/hpp.service';
import { AccountService } from '@/services/api/account.service';
import { ProductService } from '@/services/api/product.service';
import { Account, Product, BillingProfile } from '@/services/api/types';
import { getMembershipBenefit } from '@/services/utils/membershipBenefits';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Car, Shield, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {getFormattedDate} from "@/services/utils/utils";

interface UpgradePaymentSetupProps {
  account: Account;
  currentProduct: Product | null;
  newProduct: Product;
  mode: 'upgrade' | 'downgrade' | 'change';
  onSuccess: () => void;
  onBack: () => void;
}

export function UpgradePaymentSetup({
                                      account,
                                      currentProduct,
                                      newProduct,
                                      mode,
                                      onSuccess,
                                      onBack
                                    }: UpgradePaymentSetupProps) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proratedAmount, setProratedAmount] = useState<number | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      // Clear any cached token
      HPPService.clearToken();

      // Load HPP token
      const hppToken = await HPPService.getSecurityToken();
      if (!hppToken) {
        setError('Failed to initialize payment system');
        return;
      }
      setToken(hppToken);

      // Load billing profile
      const profile = await AccountService.getBillingProfileByAccountId(account.id!);
      setBillingProfile(profile);

      // Calculate prorated amount if upgrading
      if (mode === 'upgrade' && currentProduct) {
        const prorated = calculateProration(currentProduct, newProduct);
        setProratedAmount(prorated);
      }

    } catch (err) {
      console.error('Error loading payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const calculateProration = (current: Product, newProd: Product): number => {
    // Simple prorated calculation - in production, this would be done server-side
    // This is just for demonstration
    const priceDiff = newProd.price - current.price;
    return Math.max(0, priceDiff);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Deactivate current product
      if (currentProduct) {
        const accountProducts = await ProductService.getAccountProductsByAccountId(account.id!);
        const activeProduct = accountProducts.find(p =>
          p.status === 'ACTIVE' && p.productId === currentProduct.id);

        if (activeProduct) {
          // Send all required fields as per API documentation
          // Required: AccountId, Id, Quantity, ProductId, StartDate, Status
          await ProductService.updateAccountProduct(activeProduct.id!, {
            AccountId: parseInt(activeProduct.accountId),  // Must be integer
            Id: activeProduct.id,                           // The record ID
            Quantity: activeProduct.quantity.toString(),    // Must be string
            ProductId: parseInt(activeProduct.productId),   // Must be integer
            StartDate: activeProduct.startDate,             // Keep original start date
            Status: 'DEACTIVATED',                          // Change status
            EndDate: getFormattedDate(new Date())          // Set end date
          });
        }
      }

      // The new account product is created in HostedPaymentForm's successCapture
      onSuccess();
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Payment successful but failed to update subscription. Please contact support.');
    }
  };

  const getMembershipIcon = (level: string) => {
    switch(level) {
      case 'CLASSIC': return <Car className="w-5 h-5" />;
      case 'PLUS': return <Shield className="w-5 h-5" />;
      case 'PREMIER': return <Star className="w-5 h-5" />;
      default: return null;
    }
  };

  const getModeIcon = () => {
    switch(mode) {
      case 'upgrade': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'downgrade': return <TrendingDown className="w-6 h-6 text-orange-600" />;
      default: return <RefreshCw className="w-6 h-6 text-blue-600" />;
    }
  };

  const getModeText = () => {
    switch(mode) {
      case 'upgrade': return 'Upgrade';
      case 'downgrade': return 'Downgrade';
      default: return 'Change';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aaa-blue"></div>
      </div>
    );
  }

  if (error || !token || !billingProfile) {
    return (
      <div>
        <Alert variant="error" message={error || 'Payment system unavailable'} />
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>
      </div>
    );
  }

  // Get benefits for comparison
  const currentBenefits = currentProduct ? getMembershipBenefit(currentProduct.membershipLevel) : null;
  const newBenefits = getMembershipBenefit(newProduct.membershipLevel);

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-aaa-blue mb-6">
        Complete Your Membership {getModeText()}
      </h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Comparison */}
        <div className="space-y-6">
          {/* Change Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              {getModeIcon()}
            </div>
            <h3 className="text-lg font-semibold text-center mb-4">
              Membership {getModeText()} Summary
            </h3>

            {/* From */}
            {currentProduct && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">CURRENT PLAN</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMembershipIcon(currentProduct.membershipLevel)}
                    <div>
                      <p className="font-semibold">{currentProduct.membershipLevel}</p>
                      <p className="text-sm text-gray-600">
                        {currentProduct.subscriptionCycle === 'YEARLY' ? 'Annual' : 'Monthly'}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">{currentProduct.rate}</p>
                </div>
              </div>
            )}

            {/* Arrow */}
            <div className="flex justify-center my-2">
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-270 transform" />
            </div>

            {/* To */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 mb-1">NEW PLAN</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMembershipIcon(newProduct.membershipLevel)}
                  <div>
                    <p className="font-semibold">{newProduct.membershipLevel}</p>
                    <p className="text-sm text-gray-600">
                      {newProduct.subscriptionCycle === 'YEARLY' ? 'Annual' : 'Monthly'}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-aaa-blue">{newProduct.rate}</p>
              </div>
            </div>

            {/* Price Information */}
            {proratedAmount !== null && proratedAmount > 0 && (
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Amount Due Today (Prorated)</span>
                  <span className="font-bold text-green-600">${proratedAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  * Full price will apply at next renewal
                </p>
              </div>
            )}
          </div>

          {/* Benefits Comparison */}
          {mode !== 'change' && currentBenefits && newBenefits && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold mb-4">
                {mode === 'upgrade' ? 'New Benefits You\'ll Get' : 'Benefits Changes'}
              </h3>

              {mode === 'upgrade' && (
                <div className="space-y-2">
                  {newBenefits.roadsideAssistance
                    .filter(benefit => !currentBenefits.roadsideAssistance.includes(benefit))
                    .slice(0, 3)
                    .map((benefit, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">+</span>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  {newBenefits.additionalBenefits
                    .filter(benefit => !currentBenefits.additionalBenefits.includes(benefit))
                    .slice(0, 3)
                    .map((benefit, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">+</span>
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Account Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Name:</span>
                <span className="font-medium">{account.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member ID:</span>
                <span className="font-mono text-xs">{account.aaa_MemberID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billing Email:</span>
                <span className="font-medium">{billingProfile.email || billingProfile.aaa_Email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Form */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-5 py-4 border-b">
              <h3 className="font-semibold text-lg text-gray-900">Payment Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'upgrade'
                  ? 'Enter payment details to upgrade your membership'
                  : mode === 'downgrade'
                    ? 'Confirm payment method for your new plan'
                    : 'Update your payment for the billing cycle change'}
              </p>
            </div>

            <div className="p-5">
              <HostedPaymentForm
                token={token}
                accountId={account.id!}
                accountName={account.name}
                product={newProduct}
                billingProfileId={billingProfile.id}
                hostedPaymentPageExternalId={billingProfile.hostedPaymentPageExternalId}
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
                <p className="font-medium">Secure Transaction</p>
                <p className="text-blue-700 mt-1">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Selection
        </Button>
      </div>
    </div>
  );
}