'use client';

import React from 'react';
import { SaleProvider } from '@/context/SaleContext';
import { CustomerForm } from '@/components/new-sale/CustomerForm';
import { MembershipSelector } from '@/components/new-sale/MembershipSelector';
import { PaymentSetup } from '@/components/new-sale/PaymentSetup';
import { useSale } from '@/context/SaleContext';

function SaleSteps() {
  const { state } = useSale();

  const steps = [
    { number: 1, title: 'Customer Info' },
    { number: 2, title: 'Membership' },
    { number: 3, title: 'Payment' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    state.step >= step.number
                      ? 'bg-[#004B87] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.number}
                </div>
                <span className="ml-2 text-sm font-medium">
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-24 h-1 mx-4 ${
                    state.step > step.number
                      ? 'bg-[#004B87]'
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
        {state.step === 1 && <CustomerForm />}
        {state.step === 2 && <MembershipSelector />}
        {state.step === 3 && <PaymentSetup />}
      </div>
    </div>
  );
}

export default function NewSalePage() {
  return (
    <SaleProvider>
      <div>
        <h1 className="text-3xl font-bold text-[#004B87] mb-6">
          New Membership Sale
        </h1>
        <SaleSteps />
      </div>
    </SaleProvider>
  );
}