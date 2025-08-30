import React from 'react';

interface Product {
  name: string;
  displayName: string;
  membershipLevel: string;
  rate: string;
}

interface MembershipSummaryProps {
  product: Product;
}

export function MembershipSummary({ product }: MembershipSummaryProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="font-semibold mb-2">Selected Membership</h3>
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-gray-600">{product.displayName}</p>
        </div>
        <span className="font-bold text-lg">{product.rate}/month</span>
      </div>
    </div>
  );
}