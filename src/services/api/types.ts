export interface Account {
  id?: string;
  name: string;
  status: string;
  accountTypeId: string;
  accountType: string;
  aaa_MemberID: string;
  aaa_MemberAcctType: string;          // Primary
  aaa_MemberCardNumber: string;
  aaa_MemberFirstName: string;
  aaa_MemberLastName: string;
  aaa_MemberMiddleName: string;
  aaa_MemberRenewalMethod: string;     //"Autorenew"
  aaa_MembershipBillFrequency: string; // "Monthly"

}

export interface BillingProfile {
  id?: string;
  accountId: string;
  billTo: string;
  attention?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  aaa_Email: string;
  email: string;
  currencyCode: string;
  billingCycle: 'MONTHLY';  // Only MONTHLY
  paymentTermDays: number;
  billingMethod: 'MAIL' | 'EMAIL';
  invoiceDeliveryMethod: 'EMAIL' | 'MAIL';
  hostedPaymentPageExternalId: string
}

export interface Product {
  id: string;
  name: string;
  productId: string;
  ratingMethodType: string;
  price: number;
  rate: string; // Original rate string with $
  subscriptionCycle: 'MONTHLY' | 'YEARLY';
  membershipLevel: 'CLASSIC' | 'PLUS' | 'PREMIER';
  displayName: string;
  productType?: string;
  level?: string;
}

export interface AccountProduct {
  id?: string;
  name: string;
  accountId: string;
  productId: string;
  quantity: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  benefitSet: number;
  rate: string;
  renewalDate?: string;
  ratingMethodId: string;
}

export interface PromoCode {
  id: string;
  aaa_Promo_Code_Name: string;
  aaa_Promo_Code: string;
  aaa_Promo_Code_Description: string;
  aaa_Promo_Code_Status: 'ACTIVE' | 'INACTIVE';
  requiresAutopay: boolean;
  discountPercent: number;
  validProducts: string[];
}

export interface UpgradeOption {
  id: string;
  originalProductId: string;
  originalProductName: string;
  destinationProductId: string;
  destinationProductName: string;
}

export interface MembershipBenefit {
  level: 'CLASSIC' | 'PLUS' | 'PREMIER';
  tagline: string;
  roadsideAssistance: string[];
  additionalBenefits: string[];
  popularTag?: boolean;
}

export interface PromoCode {
  id: string;
  aaa_Promo_Code_Name: string;
  aaa_Promo_Code: string;
}

export interface AccountPromoCode {
  id?: string;
  AccountId: string;
  aaa_Promo_Code: string;
  aaa_PromoCodeStartDate: string;
  aaa_PromoCodeStatus: 'Active' | 'Deactivated';
}