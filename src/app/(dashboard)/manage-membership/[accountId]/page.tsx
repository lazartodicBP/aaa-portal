'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AccountService } from '@/services/api/account.service';
import { Account } from '@/services/api/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ManageMembershipPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        const accountData = await AccountService.getAccountById(accountId);
        setAccount(accountData);
      } catch (err) {
        console.error('Error fetching account:', err);
        setError('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchAccount();
    }
  }, [accountId]);

  // Also update sidebar to highlight "Manage Membership" when on this page
  useEffect(() => {
    // This will be picked up by the Sidebar component to highlight the correct menu item
    document.body.setAttribute('data-active-page', 'manage-membership');

    return () => {
      document.body.removeAttribute('data-active-page');
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aaa-blue"></div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Account not found'}</p>
        <Button onClick={() => router.push('/')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-aaa-blue">
          Manage Membership
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary">
            Add New Product
          </Button>
        </div>
      </div>

      {/* Account Information */}
      <Card title="Account Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Account Name</p>
            <p className="font-semibold">{account.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account ID</p>
            <p className="font-semibold">{account.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                account.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {account.status}
              </span>
            </p>
          </div>
        </div>
      </Card>

      {/* Current Membership Products */}
      <Card title="Current Products">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Products and subscriptions will be displayed here once Account Products are loaded.
          </p>
          {/* This will be populated with AccountProduct data when available */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-center text-gray-500">
              No active products found
            </p>
          </div>
        </div>
      </Card>

      {/* Billing Information */}
      <Card title="Billing Information">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Billing profiles and payment methods will be displayed here.
          </p>
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-center text-gray-500">
              No billing profiles found
            </p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            onClick={() => router.push(`/upgrade/${accountId}`)}
            className="w-full"
          >
            Upgrade Membership
          </Button>
        </div>
      </Card>
    </div>
  );
}