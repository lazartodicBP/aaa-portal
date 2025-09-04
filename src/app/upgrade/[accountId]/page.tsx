'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AccountService } from '@/services/api/account.service';
import { ProductService } from '@/services/api/product.service';
import { Account, Product, AccountProduct } from '@/services/api/types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft } from 'lucide-react';
import {UpgradeMembershipSelector} from "@/components/upgrade/UpgradeMembershipSelector";
import {UpgradePaymentSetup} from "@/components/upgrade/UpgradePaymentSetup";
import {determineBillingCycle, determineMembershipLevel, parsePrice} from "@/services/utils/utils";

type UpgradeMode = 'upgrade' | 'downgrade' | 'change';

export default function UpgradeMembershipPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mode, setMode] = useState<UpgradeMode>('change');
  const [step, setStep] = useState(1); // 1: Select, 2: Payment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setLoading(true);

        // Fetch account
        const accountData = await AccountService.getAccountById(accountId);
        setAccount(accountData);

        // Fetch current active subscription
        const accountProducts = await ProductService.getAccountProductsByAccountId(accountId);
        const activeProduct = accountProducts.find(p =>
          p.status === 'ACTIVE');

        if (activeProduct) {
          // Get product details efficiently - use getProductById instead of fetching all products
          try {
            const current = await ProductService.getProductById(activeProduct.productId);
            setCurrentProduct(current);
          } catch (err) {
            console.error('Could not fetch product details:', err);
            // Fall back to using account product info if product details fail
            setCurrentProduct({
              id: activeProduct.productId,
              productId: activeProduct.productId,
              name: activeProduct.name,
              rate: activeProduct.rate,
              membershipLevel: determineMembershipLevel(activeProduct.name),
              subscriptionCycle: determineBillingCycle(activeProduct.name),
              displayName: activeProduct.name,
              price: parsePrice(activeProduct.rate),
              ratingMethodType: activeProduct.ratingMethodId,
            } as Product);
          }
        } else {
          setCurrentProduct(null);
        }

      } catch (err) {
        console.error('Error fetching account data:', err);
        setError('Failed to load account information');
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchAccountData();
    }
  }, [accountId]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);

    // Determine if this is upgrade, downgrade, or lateral change
    if (currentProduct && product) {
      const currentLevel = getProductLevel(currentProduct.membershipLevel);
      const newLevel = getProductLevel(product.membershipLevel);

      if (newLevel > currentLevel) {
        setMode('upgrade');
      } else if (newLevel < currentLevel) {
        setMode('downgrade');
      } else {
        setMode('change'); // Same level, different billing cycle
      }
    }

    setStep(2); // Move to payment
  };

  const getProductLevel = (level: string): number => {
    switch (level) {
      case 'CLASSIC': return 1;
      case 'PLUS': return 2;
      case 'PREMIER': return 3;
      default: return 0;
    }
  };

  const handlePaymentSuccess = () => {
    // After successful payment and account product update
    router.push(`/manage-membership/${accountId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aaa-blue"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="text-center py-8">
        <Alert variant="error" message={error || 'Account not found'} />
        <Button onClick={() => router.push('/portal')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/manage-membership/${accountId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Membership
        </button>

        <h1 className="text-3xl font-bold text-aaa-blue">
          Change Your Membership
        </h1>
        {currentProduct && (
          <p className="text-gray-600 mt-2">
            Current Plan: <span className="font-semibold">{currentProduct.membershipLevel}</span> -
            {currentProduct.subscriptionCycle === 'YEARLY' ? ' Annual' : ' Monthly'}
          </p>
        )}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <UpgradeMembershipSelector
          currentProduct={currentProduct}
          onSelect={handleProductSelect}
          accountId={accountId}
        />
      )}

      {step === 2 && selectedProduct && (
        <UpgradePaymentSetup
          account={account}
          currentProduct={currentProduct}
          newProduct={selectedProduct}
          mode={mode}
          onSuccess={handlePaymentSuccess}
          onBack={() => setStep(1)}
        />
      )}
    </div>
  );
}