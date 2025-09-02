'use client';

import React from 'react';
import { SaleProvider } from '@/context/SaleContext';
import { MembershipSelector } from '@/components/new-sale/MembershipSelector';
import { AccountCreation } from '@/components/new-sale/AccountCreation';
import { PaymentSetup } from '@/components/new-sale/PaymentSetup';
import { CheckCircle } from 'lucide-react';
import { useSale } from '@/context/SaleContext';

function SaleSteps() {
  const { state } = useSale();

  const steps = [
    { number: 1, title: 'Select Membership' },
    { number: 2, title: 'Create Account' },
    { number: 3, title: 'Payment' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    state.step >= step.number
                      ? 'bg-aaa-blue text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {state.step > step.number ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-1 mx-4 ${
                    state.step > step.number
                      ? 'bg-aaa-blue'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div>
        {state.step === 1 && <MembershipSelector />}
        {state.step === 2 && <AccountCreation />}
        {state.step === 3 && <PaymentSetup />}
      </div>
    </div>
  );
}

export default function NewSalePage() {
  return (
    <SaleProvider>
      <div>
        <h1 className="text-3xl font-bold text-aaa-blue mb-6">
          New AAA Membership
        </h1>
        <SaleSteps />
      </div>
    </SaleProvider>
  );
}