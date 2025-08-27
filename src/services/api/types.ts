export interface Account {
  id?: string;
  name: string;
  status: string;
  accountTypeId: string;
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
  email: string;
  currencyCode: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  paymentTermDays: number;
  billingMethod: 'MAIL' | 'EMAIL';
  invoiceDeliveryMethod: 'EMAIL' | 'MAIL';
}

export interface Product {
  id: string;
  name: string;
  productId: string;
  ratingMethodType: string;
  price: number;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  membershipLevel: 'CLASSIC' | 'PLUS' | 'PREMIER';
}

export interface AccountProduct {
  id?: string;
  accountId: string;
  productId: string;
  quantity: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE';
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