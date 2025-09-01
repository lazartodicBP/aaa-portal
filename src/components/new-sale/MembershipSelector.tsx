'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { ProductService } from '@/services/api/product.service';
import { Product } from '@/services/api/types';
import { useSale } from '@/context/SaleContext';
import { CheckCircle, Car, Shield, Star } from 'lucide-react';

export function MembershipSelector() {
  const { state, dispatch } = useSale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Fetch all products (both monthly and annual)
      const data = await ProductService.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load membership options');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on selected billing cycle
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
    CLASSIC: filteredProducts.find(p => p.name.toLowerCase().includes('classic')),
    PLUS: filteredProducts.find(p => p.name.toLowerCase().includes('plus')),
    PREMIER: filteredProducts.find(p => p.name.toLowerCase().includes('premier'))
  };

  const handleSelectProduct = (product: Product) => {
    dispatch({ type: 'SET_PRODUCT', payload: product });
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'CLASSIC': return <Car className="w-8 h-8" />;
      case 'PLUS': return <Shield className="w-8 h-8" />;
      case 'PREMIER': return <Star className="w-8 h-8" />;
      default: return null;
    }
  };

  const getDescription = (level: string) => {
    switch(level) {
      case 'CLASSIC':
        return {
          tagline: 'Essential benefits for the road and beyond',
          roadside: [
            'Tows up to 3 miles',
            '$60 toward locksmith parts and labor',
            'Free emergency fuel delivery; member pays for fuel',
            'Battery service and jump start',
            'Flat tire service',
            'Referral to AAA Approved Auto Repair facilities'
          ],
          benefits: [
            'Free Hertz Gold® membership with enrollment',
            'Free ID theft protection',
            'AAA discounts on everyday purchases'
          ]
        };
      case 'PLUS':
        return {
          tagline: 'Enhanced coverage with extended benefits',
          roadside: [
            '4 service calls, tows up to 100 miles each',
            '$100 toward vehicle lockout services',
            'Free emergency fuel and delivery'
          ],
          benefits: [
            'Discount on passport photos',
            'Discount on notary services',
            'Free international AAA maps',
            '20% CARFAX report discount'
          ]
        };
      case 'PREMIER':
        return {
          tagline: 'Premium protection with maximum coverage',
          roadside: [
            '1 tow per household up to 200 miles, remaining tows up to 100 miles',
            '$150 toward vehicle lockout services',
            'Free emergency fuel and delivery'
          ],
          benefits: [
            '1 free set of printed + digital passport photos per membership year',
            'Free notary services',
            '1-day complimentary standard rental car with in-territory tow',
            '1 free CARFAX report per year and 40% discount on additional reports'
          ]
        };
      default:
        return null;
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
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-aaa-blue mb-6 text-center">
        Select Your AAA Membership
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

          // Find corresponding monthly product for savings calculation
          const monthlyProduct = products.find(p =>
            p.name.toLowerCase().includes(level.toLowerCase()) &&
            p.name.toLowerCase().includes('monthly')
          );

          const annualProduct = products.find(p =>
            p.name.toLowerCase().includes(level.toLowerCase()) &&
            p.name.toLowerCase().includes('annual')
          );

          const savings = billingCycle === 'annual' && monthlyProduct && annualProduct
            ? calculateSavings(monthlyProduct.rate, annualProduct.rate)
            : null;

          return (
            <Card
              key={product.id}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                state.selectedProduct?.id === product.id
                  ? 'ring-2 ring-aaa-blue shadow-lg'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              onClick={() => handleSelectProduct(product)}
            >
              <div className="p-6">
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

                  <div className={`
                    mt-2 text-aaa-blue text-xs font-semibold 
                    py-1 px-3 rounded-full inline-block
                    ${level === 'PLUS' ? 'bg-aaa-yellow' : 'bg-transparent'}
                  `}>
                    <span className={level === 'PLUS' ? 'visible' : 'invisible'}>
                      MOST POPULAR
                    </span>
                  </div>
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
                <p className="text-sm font-semibold text-center text-gray-700 mb-4">
                  {getDescription(level)?.tagline}
                </p>

                {/* Select Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                    state.selectedProduct?.id === product.id
                      ? 'bg-aaa-blue text-white'
                      : 'bg-gray-100 text-aaa-blue hover:bg-gray-200'
                  }`}
                >
                  {state.selectedProduct?.id === product.id ? (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Selected
                    </span>
                  ) : (
                    'Select Plan'
                  )}
                </button>

                {/* Detailed Benefits */}
                <div className="space-y-4 text-sm">
                  {/* Roadside Assistance */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Roadside Assistance</h4>
                    <ul className="space-y-1">
                      {getDescription(level)?.roadside.map((item, idx) => (
                        <li key={idx} className="flex items-start text-gray-600">
                          <span className="text-aaa-blue mr-2">•</span>
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* More Benefits */}
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-2">More benefits</h4>
                    <ul className="space-y-1">
                      {getDescription(level)?.benefits.map((item, idx) => (
                        <li key={idx} className="flex items-start text-gray-600">
                          <span className="text-aaa-blue mr-2">•</span>
                          <span className="text-xs">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: 'SET_STEP', payload: 0 })}
        >
          Back to Customer Information
        </Button>
      </div>
    </div>
  );
}