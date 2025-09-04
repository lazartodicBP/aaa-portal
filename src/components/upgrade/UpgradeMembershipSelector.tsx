'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { ProductService } from '@/services/api/product.service';
import { Product } from '@/services/api/types';
import { getMembershipBenefit } from '@/services/utils/membershipBenefits';
import { CheckCircle, Car, Shield, Star, Lock, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface UpgradeMembershipSelectorProps {
  currentProduct: Product | null;
  onSelect: (product: Product) => void;
  accountId: string;
}

export function UpgradeMembershipSelector({
                                            currentProduct,
                                            onSelect,
                                            accountId
                                          }: UpgradeMembershipSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Set initial billing cycle based on current product
    if (currentProduct) {
      setBillingCycle(currentProduct.subscriptionCycle === 'YEARLY' ? 'annual' : 'monthly');
    }
  }, [currentProduct]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load membership options');
    } finally {
      setLoading(false);
    }
  };

  // Get level number for comparison
  const getLevel = (level: string): number => {
    switch(level) {
      case 'CLASSIC': return 1;
      case 'PLUS': return 2;
      case 'PREMIER': return 3;
      default: return 0;
    }
  };

  const currentLevel = currentProduct ? getLevel(currentProduct.membershipLevel) : 0;

  // Filter products based on billing cycle
  const filteredProducts = products.filter(product => {
    const productName = product.name.toLowerCase();
    if (billingCycle === 'monthly') {
      return productName.includes('monthly');
    } else {
      return productName.includes('annual');
    }
  });

  // Group products by membership level
  const groupedProducts = {
    CLASSIC: filteredProducts.find(p => p.membershipLevel === 'CLASSIC'),
    PLUS: filteredProducts.find(p => p.membershipLevel === 'PLUS'),
    PREMIER: filteredProducts.find(p => p.membershipLevel === 'PREMIER')
  };

  // Determine if a product is selectable
  const isSelectable = (product: Product): boolean => {
    if (!currentProduct) return true;

    // Can't select the same product
    if (product.id === currentProduct.id) return false;

    // For upgrades/downgrades, always allow different levels
    const productLevel = getLevel(product.membershipLevel);
    if (productLevel !== currentLevel) return true;

    // For same level, allow changing billing cycle
    return product.subscriptionCycle !== currentProduct.subscriptionCycle;
  };

  // Get change type icon and label
  const getChangeType = (product: Product) => {
    if (!currentProduct) return null;

    const productLevel = getLevel(product.membershipLevel);

    if (product.id === currentProduct.id) {
      return { icon: <CheckCircle className="w-5 h-5" />, label: 'Current Plan', color: 'text-gray-500' };
    } else if (productLevel > currentLevel) {
      return { icon: <TrendingUp className="w-5 h-5" />, label: 'Upgrade', color: 'text-green-600' };
    } else if (productLevel < currentLevel) {
      return { icon: <TrendingDown className="w-5 h-5" />, label: 'Downgrade', color: 'text-orange-600' };
    } else {
      return { icon: <RefreshCw className="w-5 h-5" />, label: 'Change Billing', color: 'text-blue-600' };
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'CLASSIC': return <Car className="w-8 h-8" />;
      case 'PLUS': return <Shield className="w-8 h-8" />;
      case 'PREMIER': return <Star className="w-8 h-8" />;
      default: return null;
    }
  };

  // Calculate annual savings
  const calculateSavings = (monthlyPrice: string, annualPrice: string) => {
    const monthly = parseFloat(monthlyPrice.replace(/[^0-9.]/g, ''));
    const annual = parseFloat(annualPrice.replace(/[^0-9.]/g, ''));
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - annual;
    return savings > 0 ? savings.toFixed(2) : null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aaa-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Select Your New Membership Plan
      </h2>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-aaa-blue shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-aaa-blue shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Save
            </span>
          </button>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {Object.entries(groupedProducts).map(([level, product]) => {
          if (!product) return null;

          const benefits = getMembershipBenefit(level);
          const selectable = isSelectable(product);
          const changeType = getChangeType(product);
          const isCurrent = currentProduct?.id === product.id;

          // Find prices for savings calculation
          const monthlyProduct = products.find(p =>
            p.membershipLevel === level && p.subscriptionCycle === 'MONTHLY'
          );
          const annualProduct = products.find(p =>
            p.membershipLevel === level && p.subscriptionCycle === 'YEARLY'
          );
          const savings = billingCycle === 'annual' && monthlyProduct && annualProduct
            ? calculateSavings(monthlyProduct.rate, annualProduct.rate)
            : null;

          return (
            <Card
              key={product.id}
              className={`relative transition-all ${
                isCurrent
                  ? 'ring-2 ring-gray-400 bg-gray-50'
                  : selectable
                    ? 'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-aaa-blue'
                    : 'opacity-60'
              }`}
              onClick={() => selectable && onSelect(product)}
            >
              {/* Change Type Badge */}
              {changeType && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 z-10`}>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white border-2 ${changeType.color}`}>
                    {changeType.icon}
                    <span>{changeType.label}</span>
                  </div>
                </div>
              )}

              {/* Disabled Overlay for Non-selectable */}
              {!selectable && !isCurrent && (
                <div className="absolute inset-0 bg-white bg-opacity-75 z-20 rounded-lg flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div className="p-6 pt-8">
                {/* Level Icon */}
                <div className="flex justify-center mb-4 text-aaa-blue">
                  {getLevelIcon(level)}
                </div>

                {/* Level Name */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-aaa-blue">
                    {level}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.displayName || product.name}
                  </p>

                  {benefits?.popularTag && (
                    <div className="mt-2 bg-aaa-yellow text-aaa-blue text-xs font-semibold py-1 px-3 rounded-full inline-block">
                      MOST POPULAR
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-aaa-blue">
                    {product.rate}
                  </div>
                  <div className="text-sm text-gray-600">
                    {billingCycle === 'monthly' ? 'per month' : 'per year'}
                  </div>
                  {savings && billingCycle === 'annual' && (
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      Save ${savings} annually
                    </div>
                  )}
                </div>

                {/* Tagline */}
                {benefits && (
                  <p className="text-sm font-semibold text-center text-gray-700 mb-4">
                    {benefits.tagline}
                  </p>
                )}

                {/* Select Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrent
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : selectable
                        ? 'bg-aaa-blue text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!selectable}
                >
                  {isCurrent ? 'Current Plan' : selectable ? 'Select Plan' : 'Not Available'}
                </button>

                {/* Key Benefits (shortened for upgrade view) */}
                {benefits && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Key Benefits:</p>
                    <ul className="space-y-1">
                      {benefits.roadsideAssistance.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start text-gray-600">
                          <span className="text-aaa-blue mr-1">•</span>
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}