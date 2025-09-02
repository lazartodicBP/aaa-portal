import { apiClient } from './client';
import { Account, BillingProfile, AccountProduct } from './types';

export class AccountService {
  static async createAccount(account: Omit<Account, 'id'>): Promise<Account> {
    const response = await apiClient.post('/account', {
      brmObjects: [{
        Name: account.name,
        Status: 'ACTIVE',
        AccountTypeId: '681'
      }]
    });
    return response.data.brmObjects[0];
  }

  static async createBillingProfile(profile: Omit<BillingProfile, 'id'>): Promise<BillingProfile> {
    const response = await apiClient.post('/billing_profile', {
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

  static async getAccountsByName(accountName: string): Promise<Account[]> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id, Name, Status, AccountTypeId, AccountTypeIdObj.AccountType 
            FROM ACCOUNT WHERE UPPER(Name) LIKE UPPER('%${accountName}%')`
    });

    // Transform the response to match our interface
    const accounts = response.data.queryResponse || [];
    return accounts.map((acc: any) => ({
      id: acc.Id,
      name: acc.Name,
      status: acc.Status,
      accountTypeId: acc.AccountTypeId || '',
      accountType: acc['AccountTypeIdObj.AccountType'] || undefined
    }));
  }

  // Get account by ID with AccountType included
  static async getAccountById(accountId: string): Promise<Account & { accountType?: string }> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id, Name, Status, AccountTypeId, AccountTypeIdObj.AccountType FROM ACCOUNT WHERE Id = '${accountId}'`
    });

    const accounts = response.data.queryResponse || [];

    if (accounts.length === 0) {
      throw new Error('Account not found');
    }

    const acc = accounts[0];

    // Transform to match our interface and include accountType
    return {
      id: acc.Id,
      name: acc.Name,
      status: acc.Status,
      accountTypeId: acc.AccountTypeId || '',
      accountType: acc['AccountTypeIdObj.AccountType'] || undefined
    };
  }

  // Get AccountTypeId by AccountType name
  static async getAccountType(accountTypeName: string): Promise<string | null> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id FROM ACCOUNT_TYPE WHERE AccountType = '${accountTypeName}'`
    });

    const accountTypes = response.data.queryResponse || [];
    console.log("Account types:", accountTypes);

    if (accountTypes.length === 0) {
      console.warn(`AccountType '${accountTypeName}' not found`);
      return null;
    }

    return accountTypes[0].Id;
  }
}