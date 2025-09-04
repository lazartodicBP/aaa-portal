import React from 'react';
import { Product } from '@/services/api/types';
import { getMembershipBenefit } from '@/services/utils/membershipBenefits';
import { Car, Shield, Star, Check } from 'lucide-react';

interface MembershipSummaryProps {
  product: Product;
  promoCode?: string;
  discountPercent?: number;
}

export function MembershipSummary({ product, promoCode, discountPercent }: MembershipSummaryProps) {
  // Get membership benefits data
  const benefits = getMembershipBenefit(product.membershipLevel);

  // Calculate discounted price if promo code is applied
  const originalPrice = product.price;
  const discountedPrice = discountPercent
    ? originalPrice * (1 - discountPercent / 100)
    : originalPrice;

  // Format the rate display based on subscription cycle
  const rateDisplay = product.subscriptionCycle === 'YEARLY'
    ? `${product.rate}/year`
    : `${product.rate}/month`;

  // Determine membership level color and icon
  const levelConfig = {
    'CLASSIC': {
      color: 'text-gray-600 bg-gray-100 border-gray-200',
      icon: <Car className="w-5 h-5" />
    },
    'PLUS': {
      color: 'text-blue-600 bg-blue-100 border-blue-200',
      icon: <Shield className="w-5 h-5" />
    },
    'PREMIER': {
      color: 'text-purple-600 bg-purple-100 border-purple-200',
      icon: <Star className="w-5 h-5" />
    }
  };

  const config = levelConfig[product.membershipLevel] || levelConfig['CLASSIC'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-aaa-blue to-blue-700 text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center">
            Selected Membership
          </h3>
          {benefits?.popularTag && (
            <span className="bg-aaa-yellow text-aaa-blue px-3 py-1 rounded-full text-xs font-bold">
              MOST POPULAR
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Product Name and Level */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg border ${config.color}`}>
              {config.icon}
            </div>
            <div>
              <h4 className="font-bold text-xl text-gray-900">
                {product.membershipLevel} Membership
              </h4>
              <p className="text-sm text-gray-600">{product.displayName || product.name}</p>
            </div>
          </div>
          {benefits && (
            <p className="text-sm text-gray-700 italic mt-2 pl-11">
              "{benefits.tagline}"
            </p>
          )}
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Billing Cycle:</span>
              <span className="font-medium text-sm">{product.subscriptionCycle}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Regular Price:</span>
              <span className={`font-semibold ${discountPercent ? 'line-through text-gray-400' : ''}`}>
                {rateDisplay}
              </span>
            </div>

            {/* Promo code discount */}
            {promoCode && discountPercent && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Promo Code:</span>
                  <span className="text-green-600 font-mono text-sm bg-green-50 px-2 py-1 rounded">
                    {promoCode}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-green-600 font-semibold">-{discountPercent}%</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Price:</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">
                        ${discountedPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        /{product.subscriptionCycle === 'YEARLY' ? 'year' : 'month'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {benefits && (
          <div className="space-y-4">
            {/* Roadside Assistance */}
            <div className="border-t pt-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Car className="w-4 h-4 mr-2 text-aaa-blue" />
                Roadside Assistance Benefits
              </h5>
              <ul className="space-y-2">
                {benefits.roadsideAssistance.map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Benefits */}
            <div className="border-t pt-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2 text-aaa-blue" />
                Additional Member Benefits
              </h5>
              <ul className="space-y-2">
                {benefits.additionalBenefits.map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Product Details */}
        <div className="border-t pt-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
              Technical Details
            </summary>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Product ID:</span>
                <span className="font-mono">{product.id}</span>
              </div>
              {product.productType && (
                <div className="flex justify-between">
                  <span>Product Type:</span>
                  <span>{product.productType}</span>
                </div>
              )}
              {product.level && (
                <div className="flex justify-between">
                  <span>Tier Level:</span>
                  <span>{product.level}</span>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}