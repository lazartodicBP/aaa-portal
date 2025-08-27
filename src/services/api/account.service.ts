import { apiClient } from './client';
import { Account, BillingProfile, AccountProduct } from './types';

export class AccountService {
  static async createAccount(account: Omit<Account, 'id'>): Promise<Account> {
    const response = await apiClient.patch('/account', {
      brmObjects: [{
        Name: account.name,
        Status: account.status,
        AccountTypeId: account.accountTypeId
      }]
    });
    return response.data.brmObjects[0];
  }

  static async createBillingProfile(profile: Omit<BillingProfile, 'id'>): Promise<BillingProfile> {
    const response = await apiClient.patch('/billing_profile', {
      externalIDFieldName: 'AccountId',
      brmObjects: [{
        AccountIdObj: { ExtAcctId: profile.accountId },
        BillTo: profile.billTo,
        Attention: profile.attention,
        Address1: profile.address1,
        Address2: profile.address2,
        City: profile.city,
        Country: profile.country,
        State: profile.state,
        ZIP: profile.zip,
        ActivityTimeZone: 'US/Central',
        TimeZoneIdObj: { Tzname: 'US/Central' },
        CurrencyCode: profile.currencyCode,
        MonthlyBillingDate: '31',
        ManualCloseFlag: '1',
        InvoiceDeliveryMethod: profile.invoiceDeliveryMethod,
        InvoiceApprovalFlag: '1',
        BillingCycle: profile.billingCycle,
        PaymentTermDays: profile.paymentTermDays.toString(),
        BillingMethod: profile.billingMethod,
        Email: profile.email
      }]
    });
    return response.data.brmObjects[0];
  }

  static async createAccountProduct(product: Omit<AccountProduct, 'id'>): Promise<AccountProduct> {
    const response = await apiClient.patch('/ACCOUNT_PRODUCT', {
      brmObjects: [{
        AccountIdObj: { Id: product.accountId },
        Quantity: product.quantity.toString(),
        StartDate: product.startDate,
        EndDate: product.endDate || '',
        ProductId: product.productId,
        Status: product.status
      }]
    });
    return response.data.brmObjects[0];
  }

  static async updateAccountProduct(productId: string, updates: Partial<AccountProduct>): Promise<AccountProduct> {
    const response = await apiClient.patch(`/ACCOUNT_PRODUCT/${productId}`, {
      brmObjects: [updates]
    });
    return response.data.brmObjects[0];
  }
}