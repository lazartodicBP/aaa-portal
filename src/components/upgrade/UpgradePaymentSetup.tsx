'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { HostedPaymentForm } from '@/components/new-sale/HostedPaymentForm';
import { HPPService } from '@/services/api/hpp.service';
import { AccountService } from '@/services/api/account.service';
import { ProductService } from '@/services/api/product.service';
import { PromoService } from '@/services/api/promo.service';
import { Account, Product, BillingProfile, PromoCode } from '@/services/api/types';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Car, Shield, Star, Tag, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFormattedDate } from "@/services/utils/utils";

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
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([]);

  useEffect(() => {
    loadPaymentData();
    if (newProduct.subscriptionCycle === 'YEARLY') {
      loadPromoCodes();
    }
  }, []);

  useEffect(() => {
    // Auto-suggest promo code for annual plans
    if (newProduct.subscriptionCycle === 'YEARLY') {
      setPromoCodeInput('autopay50');
    }
  }, [newProduct]);

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
        const prorated = calculateProration(currentProduct, newProduct, null);
        setProratedAmount(prorated);
      }

    } catch (err) {
      console.error('Error loading payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodes = async () => {
    try {
      const promos = await PromoService.getAvailablePromoCodes();
      setAvailablePromos(promos);
    } catch (err) {
      console.error('Failed to load promo codes:', err);
    }
  };

  const calculateProration = (current: Product, newProd: Product, promo: PromoCode | null): number => {
    let priceDiff = newProd.price - current.price;

    // Apply promo discount if applicable
    if (promo?.aaa_Promo_Code === 'autopay50' && autoPayEnabled) {
      priceDiff = priceDiff * 0.5; // 50% discount
    }

    return Math.max(0, priceDiff);
  };

  const applyPromoCode = () => {
    const foundPromo = availablePromos.find(p =>
      p.aaa_Promo_Code.toLowerCase() === promoCodeInput.toLowerCase()
    );

    if (foundPromo) {
      setPromoCode(foundPromo);
      setPromoApplied(true);

      // Recalculate if needed
      if (mode === 'upgrade' && currentProduct) {
        const prorated = calculateProration(currentProduct, newProduct, foundPromo);
        setProratedAmount(prorated);
      }
    } else {
      setError('Invalid promo code');
      setTimeout(() => setError(null), 3000);
    }
  };

  const removePromoCode = () => {
    setPromoCode(null);
    setPromoApplied(false);
    setPromoCodeInput('');
    setAutoPayEnabled(false);

    // Recalculate without promo
    if (mode === 'upgrade' && currentProduct) {
      const prorated = calculateProration(currentProduct, newProduct, null);
      setProratedAmount(prorated);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePaymentSuccess = async (paymentData: any, additionalData?: { promoCode?: PromoCode | null; autoPayEnabled?: boolean }) => {
    try {
      // Use additionalData to get promoCode and autoPayEnabled
      const { promoCode, autoPayEnabled } = additionalData || {};

      // If promo code is present and AutoPay is enabled, add the promo code
      if (promoCode && autoPayEnabled && promoCode.aaa_Promo_Code === 'autopay50') {
        try {
          await PromoService.addPromoCodeToAccount(account.id!, promoCode.id);
          console.log('Promo code applied successfully');
        } catch (promoErr) {
          console.error('Failed to apply promo code:', promoErr);
        }
      }

      // Deactivate current product if exists
      if (currentProduct) {
        const accountProducts = await ProductService.getAccountProductsByAccountId(account.id!);
        const activeProduct = accountProducts.find(p =>
          p.status === 'ACTIVE' && p.productId === currentProduct.id);

        if (activeProduct) {
          await ProductService.updateAccountProduct(activeProduct.id!, {
            AccountId: parseInt(activeProduct.accountId),
            Id: activeProduct.id,
            Quantity: activeProduct.quantity.toString(),
            ProductId: parseInt(activeProduct.productId),
            StartDate: activeProduct.startDate,
            Status: 'DEACTIVATED',
            EndDate: getFormattedDate(new Date())
          });
        }
      }

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

  if (!token || !billingProfile) {
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

  const getDiscountedPrice = () => {
    if (promoCode?.aaa_Promo_Code === 'autopay50' && autoPayEnabled) {
      return newProduct.price * 0.5;
    }
    return newProduct.price;
  };

  const isAnnualPlan = newProduct.subscriptionCycle === 'YEARLY';

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
                      {isAnnualPlan ? 'Annual' : 'Monthly'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-aaa-blue">
                    {promoApplied && autoPayEnabled ? (
                      <>
                        <span className="line-through text-gray-400 text-sm">{newProduct.rate}</span>
                        <span className="ml-2">${getDiscountedPrice().toFixed(2)}</span>
                      </>
                    ) : newProduct.rate}
                  </p>
                </div>
              </div>
            </div>

            {/* Promo Code Section - Only for Annual Plans */}
            {isAnnualPlan && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code {promoApplied && <span className="text-green-600">(Applied)</span>}
                </label>
                {!promoApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue"
                      disabled={promoApplied}
                    />
                    <Button
                      onClick={applyPromoCode}
                      disabled={!promoCodeInput || promoApplied}
                      className="whitespace-nowrap"
                    >
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          {promoCode?.aaa_Promo_Code}
                        </span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    {promoCode?.aaa_Promo_Code === 'autopay50' && (
                      <p className="text-xs text-green-700 mt-1">
                        50% discount {autoPayEnabled ? 'will be applied' : 'requires AutoPay to be enabled'}
                      </p>
                    )}
                  </div>
                )}

                {/* Mock AutoPay Checkbox - Only show when promo is applied */}
                {promoApplied && promoCode?.aaa_Promo_Code === 'autopay50' && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPayEnabled}
                        onChange={(e) => setAutoPayEnabled(e.target.checked)}
                        className="mr-2 h-4 w-4 text-aaa-blue border-gray-300 rounded focus:ring-aaa-blue"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Enable Auto-Pay for 50% Discount
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

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
                promoCode={promoCode}
                autoPayEnabled={autoPayEnabled}
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