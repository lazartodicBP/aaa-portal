import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { AccountNameForm } from './AccountNameForm';
import { BillingProfileForm } from './BillingProfileForm';
import { AccountService } from '@/services/api/account.service';
import { useSale } from '@/context/SaleContext';
import { Account, BillingProfile } from "@/services/api/types";

export function AccountCreation() {
  const { state, dispatch } = useSale();

  // Separate first and last name states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [memberAcctType, setMemberAcctType] = useState<'Primary' | 'Associate'>('Primary');
  const [billFrequency, setBillFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');

  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [billingDetails, setBillingDetails] = useState({
    address1: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    email: ''
  });

  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate first and last name
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('Both first name and last name are required');
      return false;
    }

    setNameError(null);

    // Validate billing details
    if (!billingDetails.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!billingDetails.address1.trim()) {
      errors.address1 = 'Address is required';
    }

    if (!billingDetails.city.trim()) {
      errors.city = 'City is required';
    }

    if (!billingDetails.state) {
      errors.state = 'State is required';
    }

    if (!billingDetails.zip.trim()) {
      errors.zip = 'ZIP code is required';
    } else if (!/^\d{5}$/.test(billingDetails.zip)) {
      errors.zip = 'Please enter a valid 5-digit ZIP code';
    }

    setBillingErrors(errors);
    return Object.keys(errors).length === 0 && !nameError;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construct account name from first and last name
      const accountName = `${firstName.trim()} ${lastName.trim()}`;

      // Create account with the additional options
      const account = await AccountService.createAccount(
        accountName,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          memberAcctType: memberAcctType,
          billFrequency: billFrequency
        }
      );

      if (!account || !account.id) {
        throw new Error('Failed to create account');
      }

      console.log('Account created:', account);

      // Map billing frequency to billing cycle format
      const billingCycle = billFrequency === 'Monthly' ? 'MONTHLY' : 'YEARLY';

      // Create billing profile with matching billing cycle
      const billingProfile = await AccountService.createBillingProfile({
        accountId: account.id,
        billTo: accountName,
        address1: billingDetails.address1,
        city: billingDetails.city,
        state: billingDetails.state,
        zip: billingDetails.zip,
        country: billingDetails.country,
        email: billingDetails.email,
        aaa_Email: billingDetails.email,
        billingCycle: billingCycle
      });

      if (!billingProfile || !billingProfile.id) {
        throw new Error('Failed to create billing profile');
      }

      console.log('Billing profile created:', billingProfile);

      // Store both account and billing profile in context
      dispatch({
        type: 'SET_ACCOUNT_AND_BILLING',
        payload: {
          account: {
            ...account,
            id: account.id!
          } as Account,
          billingProfile: {
            ...billingProfile,
            id: billingProfile.id!
          } as BillingProfile
        }
      });

      // Move to payment step
      dispatch({ type: 'SET_STEP', payload: 3 });

    } catch (err: any) {
      console.error('Account creation error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-aaa-blue mb-6">
        Create Your Account
      </h2>

      {error && (
        <Alert variant="error" message={error} className="mb-4" />
      )}

      <div className="space-y-6">
        {/* Updated Account Name Form with new fields */}
        <AccountNameForm
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          memberAcctType={memberAcctType}
          setMemberAcctType={setMemberAcctType}
          billFrequency={billFrequency}
          setBillFrequency={setBillFrequency}
          nameError={nameError}
          setNameError={setNameError}
        />

        {/* Billing Details Form */}
        <BillingProfileForm
          formData={billingDetails}
          setFormData={setBillingDetails}
          errors={billingErrors}
          setErrors={setBillingErrors}
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateAccount}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue to Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
}