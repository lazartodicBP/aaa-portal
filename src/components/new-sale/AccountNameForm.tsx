import React from 'react';
import { Button } from '../ui/Button';

interface AccountNameFormProps {
  accountName: string;
  setAccountName: (name: string) => void;
  nameError: string | null;
  setNameError: (error: string | null) => void;
}

export function AccountNameForm({
                                  accountName,
                                  setAccountName,
                                  nameError,
                                  setNameError,
                                }: AccountNameFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="font-semibold mb-4">Account Information</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
            Account Name *
          </label>
          <input
            type="text"
            id="accountName"
            value={accountName}
            onChange={(e) => {
              setAccountName(e.target.value);
              setNameError(null); // Clear error when user types
            }}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
              nameError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your full name"
          />
          {nameError && (
            <p className="mt-1 text-sm text-red-600">{nameError}</p>
          )}
        </div>
      </div>
    </div>
  );
}