'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AccountService } from '@/services/api/account.service';
import { ProductService } from '@/services/api/product.service';
import { Account, BillingProfile, AccountProduct, Product } from '@/services/api/types';
import { getMembershipBenefit } from '@/services/utils/membershipBenefits';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { User, CreditCard, Package, Calendar, Mail, MapPin, Shield, Car, Star } from 'lucide-react';

export default function ManageMembershipPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
  const [accountProducts, setAccountProducts] = useState<AccountProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch account details
        const accountData = await AccountService.getAccountById(accountId);
        setAccount(accountData);

        // Fetch billing profile
        try {
          const billingData = await AccountService.getBillingProfileByAccountId(accountId);
          setBillingProfile(billingData);
        } catch (err) {
          console.log('No billing profile found for account');
        }

        // Fetch account products
        try {
          const productsData = await ProductService.getAccountProductsByAccountId(accountId);
          setAccountProducts(productsData);
        } catch (err) {
          console.log('No products found for account');
        }

        // Fetch all available products for reference
        const allProducts = await ProductService.getProducts();
        setProducts(allProducts);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load account details');
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchAllData();
    }
  }, [accountId]);

  // Update sidebar to highlight "Manage Membership" when on this page
  useEffect(() => {
    document.body.setAttribute('data-active-page', 'manage-membership');
    return () => {
      document.body.removeAttribute('data-active-page');
    };
  }, []);

  // Get membership icon based on level
  const getMembershipIcon = (level: string) => {
    switch(level?.toUpperCase()) {
      case 'CLASSIC': return <Car className="w-5 h-5" />;
      case 'PLUS': return <Shield className="w-5 h-5" />;
      case 'PREMIER': return <Star className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  // Get product details from product ID
  const getProductDetails = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
        <Alert variant="error" message={error || 'Account not found'} />
        <Button onClick={() => router.push('/portal')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Get active subscription
  const activeProduct = accountProducts.find(p => p.status === 'ACTIVE');
  const activeProductDetails = activeProduct ? getProductDetails(activeProduct.productId) : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-aaa-blue">
          Manage Membership
        </h1>
        <div className="flex gap-2">
          {activeProductDetails && (
            <Button
              variant="primary"
              onClick={() => router.push(`/upgrade/${accountId}`)}
            >
              Upgrade Membership
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push('/')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Account Information */}
      <Card header={
        <div className="flex items-center">
          <User className="w-5 h-5 mr-2 text-aaa-blue" />
          Account Information
        </div>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Account Name</p>
            <p className="font-semibold">{account.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member ID</p>
            <p className="font-mono text-sm">{account.aaa_MemberID || account.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Card Number</p>
            <p className="font-mono">{account.aaa_MemberCardNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="font-semibold">{account.aaa_MemberAcctType || 'Primary'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Renewal Method</p>
            <p className="font-semibold">{account.aaa_MemberRenewalMethod || 'Autorenew'}</p>
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

      {/* Current Membership */}
      <Card header={
        <div className="flex items-center">
          <Package className="w-5 h-5 mr-2 text-aaa-blue" />
          Current Membership
        </div>
      }>
        {activeProduct && activeProductDetails ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getMembershipIcon(activeProductDetails.membershipLevel)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {activeProductDetails.membershipLevel} Membership
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeProductDetails.displayName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-aaa-blue">
                  {activeProductDetails.rate}
                </p>
                <p className="text-sm text-gray-600">
                  {activeProductDetails.subscriptionCycle === 'YEARLY' ? 'per year' : 'per month'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{formatDate(activeProduct.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Renewal Date</p>
                <p className="font-semibold">{formatDate(activeProduct.endDate || '')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {activeProduct.status}
                </span>
              </div>
            </div>

            {/* Benefits Summary */}
            {(() => {
              const benefits = getMembershipBenefit(activeProductDetails.membershipLevel);
              return benefits ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Included Benefits:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {benefits.roadsideAssistance.slice(0, 4).map((benefit, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No active membership found</p>
            <Button
              variant="primary"
              onClick={() => router.push('/new-sale')}
              className="mt-4"
            >
              Purchase Membership
            </Button>
          </div>
        )}
      </Card>

      {/* Billing Information */}
      <Card header={
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-aaa-blue" />
          Billing Information
        </div>
      }>
        {billingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bill To</p>
                <p className="font-semibold">{billingProfile.billTo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{billingProfile.email || billingProfile.aaa_Email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Cycle</p>
                <p className="font-semibold">{billingProfile.billingCycle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Terms</p>
                <p className="font-semibold">{billingProfile.paymentTermDays} days</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Billing Address</p>
                  <p className="text-sm text-gray-600">
                    {billingProfile.address1}<br />
                    {billingProfile.address2 && <>{billingProfile.address2}<br /></>}
                    {billingProfile.city}, {billingProfile.state} {billingProfile.zip}<br />
                    {billingProfile.country}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start">
                <Mail className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Invoice Delivery</p>
                  <p className="text-sm text-gray-600">
                    Method: {billingProfile.invoiceDeliveryMethod}<br />
                    Billing Method: {billingProfile.billingMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No billing profile found</p>
          </div>
        )}
      </Card>

      {/* Past Subscriptions */}
      {accountProducts.filter(p => p.status !== 'ACTIVE').length > 0 && (
        <Card header="Past Subscriptions">
          <div className="space-y-2">
            {accountProducts.filter(p => p.status !== 'ACTIVE').map((product) => {
              const productDetails = getProductDetails(product.productId);
              return (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      {productDetails?.displayName || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(product.startDate)} - {formatDate(product.endDate || '')}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{product.status}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}