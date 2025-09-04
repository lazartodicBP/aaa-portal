import React from 'react';

interface AccountNameFormProps {
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  memberAcctType: 'Primary' | 'Associate';
  setMemberAcctType: (type: 'Primary' | 'Associate') => void;
  billFrequency: 'Monthly' | 'Yearly';
  setBillFrequency: (freq: 'Monthly' | 'Yearly') => void;
  nameError: string | null;
  setNameError: (error: string | null) => void;
}

export function AccountNameForm({
                                  firstName,
                                  setFirstName,
                                  lastName,
                                  setLastName,
                                  memberAcctType,
                                  setMemberAcctType,
                                  billFrequency,
                                  setBillFrequency,
                                  nameError,
                                  setNameError,
                                }: AccountNameFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="font-semibold mb-4">Account Information</h3>
      <div className="space-y-4">
        {/* Name Fields - Row Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setNameError(null);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
                nameError && !firstName.trim() ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setNameError(null);
              }}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
                nameError && !lastName.trim() ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
          </div>
        </div>

        {nameError && (
          <p className="text-sm text-red-600">{nameError}</p>
        )}

        {/* Member Account Type Dropdown */}
        <div>
          <label htmlFor="memberAcctType" className="block text-sm font-medium text-gray-700 mb-2">
            Member Account Type *
          </label>
          <select
            id="memberAcctType"
            value={memberAcctType}
            onChange={(e) => setMemberAcctType(e.target.value as 'Primary' | 'Associate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue"
          >
            <option value="Primary">Primary</option>
            <option value="Associate">Associate</option>
          </select>
        </div>

        {/* Billing Frequency Dropdown */}
        <div>
          <label htmlFor="billFrequency" className="block text-sm font-medium text-gray-700 mb-2">
            Billing Frequency *
          </label>
          <select
            id="billFrequency"
            disabled={true}
            value={'Monthly'} // Only MONTHLY
            onChange={(e) => setBillFrequency(e.target.value as 'Monthly' | 'Yearly')}
            className="w-full bg-blue-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue"
          >
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Choose how often you'd like to be billed for your membership
          </p>
        </div>
      </div>
    </div>
  );
}