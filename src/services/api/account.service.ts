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

  static async getAccountByName(accountName: string): Promise<Account | null> {
    const response = await apiClient.get('/ACCOUNT', {
      params: {
        queryAnsiSql: `Name='${accountName}'`
      }
    });

    // The API returns an array in retrieveResponse
    const accounts = response.data.retrieveResponse;

    // Return the first account if found, otherwise null
    return accounts && accounts.length > 0 ? accounts[0] : null;
  }

  static async getAccountsByName(accountName: string): Promise<Account[]> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id, Name, Status FROM ACCOUNT WHERE UPPER(Name) LIKE UPPER('%${accountName}%')`
    });

    // Transform the response to match our interface
    const accounts = response.data.queryResponse || [];
    return accounts.map((acc: any) => ({
      id: acc.Id,
      name: acc.Name,
      status: acc.Status,
      accountTypeId: acc.AccountTypeId || ''
    }));
  }

  // Transform API response for single account
  static async getAccountById(accountId: string): Promise<Account> {
    const response = await apiClient.get(`/ACCOUNT/${accountId}`);
    const acc = response.data.retrieveResponse[0];

    // Transform to match our interface
    return {
      id: acc.Id,
      name: acc.Name,
      status: acc.Status,
      accountTypeId: acc.AccountTypeId || ''
    };
  }
}