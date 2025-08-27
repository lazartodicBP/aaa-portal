'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { ProductService } from '@/services/api/product.service';
import { Product } from '@/services/api/types';
import { useSale } from '@/context/SaleContext';
import { CheckCircle } from 'lucide-react';

export function MembershipSelector() {
  const { state, dispatch } = useSale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProducts();
      console.log(data);
      setProducts(data);
    } catch (err) {
      setError('Failed to load membership options');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: Product) => {
    dispatch({ type: 'SET_PRODUCT', payload: product });
  };

  const handleContinue = () => {
    if (state.selectedProduct) {
      dispatch({ type: 'SET_STEP', payload: 3 });
    }
  };

  const membershipLevels = ['CLASSIC', 'PLUS', 'PREMIER'];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#004B87] mb-6">
        Select Membership Type
      </h2>

      {error && <Alert variant="error" message={error} />}

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {membershipLevels.map((level) => {
          const monthlyProduct = products.find(
            p => p.membershipLevel === level && p.billingCycle === 'MONTHLY'
          );
          const annualProduct = products.find(
            p => p.membershipLevel === level && p.billingCycle === 'ANNUAL'
          );

          return (
            <Card
              key={level}
              className={`relative ${
                state.selectedProduct?.membershipLevel === level
                  ? 'ring-2 ring-[#004B87]'
                  : ''
              }`}
            >
              <div className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-[#004B87]">{level}</h3>
                  {level === 'PLUS' && (
                    <div className="mt-2 bg-[#FDB913] text-[#004B87] text-sm font-semibold py-1 px-3 rounded inline-block">
                      Most Popular
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {monthlyProduct && (
                    <button
                      onClick={() => handleSelectProduct(monthlyProduct)}
                      className={`w-full p-3 border rounded-lg transition-colors ${
                        state.selectedProduct?.id === monthlyProduct.id
                          ? 'border-[#004B87] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-semibold">Monthly</div>
                          <div className="text-sm text-gray-600">
                            ${monthlyProduct.price}/month
                          </div>
                        </div>
                        {state.selectedProduct?.id === monthlyProduct.id && (
                          <CheckCircle className="w-5 h-5 text-[#004B87]" />
                        )}
                      </div>
                    </button>
                  )}

                  {annualProduct && (
                    <button
                      onClick={() => handleSelectProduct(annualProduct)}
                      className={`w-full p-3 border rounded-lg transition-colors ${
                        state.selectedProduct?.id === annualProduct.id
                          ? 'border-[#004B87] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-semibold">Annual</div>
                          <div className="text-sm text-gray-600">
                            ${annualProduct.price}/year
                          </div>
                          <div className="text-xs text-green-600">
                            Save ${(monthlyProduct?.price || 0) * 12 - annualProduct.price}
                          </div>
                        </div>
                        {state.selectedProduct?.id === annualProduct.id && (
                          <CheckCircle className="w-5 h-5 text-[#004B87]" />
                        )}
                      </div>
                    </button>
                  )}
                </div>

                {/* Benefits list would go here */}
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <ul className="space-y-1">
                    <li>✓ 24/7 Roadside Assistance</li>
                    {level !== 'CLASSIC' && <li>✓ Extended Towing</li>}
                    {level === 'PREMIER' && <li>✓ Free One-Day Battery</li>}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!state.selectedProduct}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}