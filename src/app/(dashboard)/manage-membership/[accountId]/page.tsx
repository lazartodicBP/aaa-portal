'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AccountService } from '@/services/api/account.service';
import { ProductService } from '@/services/api/product.service';
import { Account, BillingProfile, AccountProduct, Product } from '@/services/api/types';
import { getMembershipBenefit } from '@/services/utils/membershipBenefits';
import { getBenefitSetName, determineMembershipLevel } from '@/services/utils/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PromoCodeModal } from '@/components/modals/PromoCodeModal';
import { User, CreditCard, Package, Calendar, Mail, MapPin, Shield, Car, Star, Tag } from 'lucide-react';

export default function ManageMembershipPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;

  const [account, setAccount] = useState<Account | null>(null);
  const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
  const [activeAccountProduct, setActiveAccountProduct] = useState<AccountProduct | null>(null);
  const [activeProductDetails, setActiveProductDetails] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);

  useEffect(() => {
    let isMounted = true; // Add cleanup flag to prevent state updates on unmounted component

    const fetchAllData = async () => {
      if (!accountId) {
        setError('Invalid account ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch account details
        const accountData = await AccountService.getAccountById(accountId);
        if (!accountData) {
          throw new Error('Account not found');
        }
        if (isMounted) {
          setAccount(accountData);
        }

        // Fetch billing profile - don't fail if not found
        try {
          const billingData = await AccountService.getBillingProfileByAccountId(accountId);
          if (isMounted) {
            setBillingProfile(billingData);
          }
        } catch (err) {
          if (isMounted) {
            setBillingProfile(null);
          }
        }

        // Fetch account products and find active one
        try {
          const accountProducts = await ProductService.getAccountProductsByAccountId(accountId);

          const activeProduct = accountProducts.find(p =>
            p.status === 'ACTIVE'
            && (p.name.toLowerCase().includes('annual') || p.name.toLowerCase().includes('monthly')));

          if (activeProduct) {
            if (isMounted) {
              setActiveAccountProduct(activeProduct);
            }

            // Fetch product details
            try {
              const productDetails = await ProductService.getProductById(activeProduct.productId);
              if (isMounted) {
                setActiveProductDetails(productDetails);
              }
            } catch (productErr) {
              // If product details fail, just continue without them
              console.error('Could not fetch product details:', productErr);
              if (isMounted) {
                setActiveProductDetails(null);
              }
            }
          } else {
            if (isMounted) {
              setActiveAccountProduct(null);
              setActiveProductDetails(null);
            }
          }
        } catch (err) {
          if (isMounted) {
            setActiveAccountProduct(null);
            setActiveProductDetails(null);
          }
        }

      } catch (err: any) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load account details');
        }
      } finally {
        // Always set loading to false when done
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [accountId]);

  // Get membership icon based on level
  const getMembershipIcon = (level: string) => {
    switch(level?.toUpperCase()) {
      case 'CLASSIC': return <Car className="w-5 h-5" />;
      case 'PLUS': return <Shield className="w-5 h-5" />;
      case 'PREMIER': return <Star className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  // Calculate the current membership level using existing utilities
  const membershipLevel = activeProductDetails
    ? determineMembershipLevel(activeProductDetails.name) : 'CLASSIC';


  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
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
        <Button onClick={() => router.push('/')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-aaa-blue">
          Manage Membership
        </h1>
        <div className="flex gap-2">
          {activeAccountProduct && (
            <>
              <Button
                variant="primary"
                onClick={() => setShowPromoModal(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Tag className="w-4 h-4 mr-2" />
                Add Promo Code
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push(`/upgrade/${accountId}`)}
              >
                Upgrade/Downgrade Membership
              </Button>
            </>
          )}
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
            <p className="font-mono text-sm">{account.aaa_MemberID || account.id || 'N/A'}</p>
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
        {activeAccountProduct ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getMembershipIcon(membershipLevel)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {membershipLevel} Membership
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeAccountProduct.name || getBenefitSetName(activeAccountProduct.benefitSet.toString())}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-aaa-blue">
                  {activeAccountProduct.rate || activeProductDetails?.rate || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  {activeProductDetails?.subscriptionCycle === 'YEARLY' ? 'per year' : 'per month'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-semibold">{formatDate(activeAccountProduct.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Renewal Date</p>
                <p className="font-semibold">{formatDate(activeAccountProduct.renewalDate || activeAccountProduct.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {activeAccountProduct.status}
                </span>
              </div>
            </div>

            {/* Benefits Summary */}
            {(() => {
              const benefits = getMembershipBenefit(membershipLevel);
              return benefits ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Included Benefits:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    {benefits.roadsideAssistance.slice(0, 4).map((benefit, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2">✔</span>
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

      {/* Promo Code Modal */}
      <PromoCodeModal
        isOpen={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        accountId={accountId}
        onSuccess={() => {
          // Optionally refresh account data or show success message
          setShowPromoModal(false);
        }}
      />
    </div>
  );
}