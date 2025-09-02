import { apiClient } from './client';
import { Account, BillingProfile, AccountProduct } from './types';

export class AccountService {
  static async createAccount(name: string): Promise<Account> {
    const response = await apiClient.post('/ACCOUNT', {
      brmObjects: [{
        Name: name,
        Status: 'ACTIVE',
        AccountTypeId: '681'  // Member account type
      }]
    });

    // @ts-ignore
    const createdAccount = response.createResponse[0].Id;

    // Transform the response to match our interface
    return {
      id: createdAccount.Id,
      name: createdAccount.Name,
      status: createdAccount.Status,
      accountTypeId: createdAccount.AccountTypeId || '681',
      accountType: 'Member'
    };
  }

  static async createBillingProfile(profile: Pick<BillingProfile, 'accountId' | 'billTo' | 'address1' | 'city' | 'state' | 'zip' | 'country' | 'email'>): Promise<BillingProfile> {
    const response = await apiClient.post('/BILLING_PROFILE', {
      brmObjects: [{
        AccountId: profile.accountId,
        BillTo: profile.billTo,
        Address1: profile.address1,
        City: profile.city || '',
        State: profile.state || '',
        Zip: profile.zip || '',
        Country: profile.country || '',
        Email: profile.email,
        // Hardcoded fields
        BillingCycle: 'MONTHLY',
        BillingCloseDate: '31',
        PaymentTermDays: '30',
        MonthlyBillingDate: '31',
        ManualCloseFlag: '1',
        InvoiceTemplateId: '122',
        InvoiceDeliveryMethod: 'EMAIL',
        InvoiceApprovalFlag: '1',
        BillingMethod: 'MAIL',
        TimeZoneId: '351',
        CurrencyCode: 'USD',
        ActivityTimeZone: 'US/Pacific'
      }]
    });

    const createdProfile = response.data.brmObjects[0];

    // Transform the response to match our interface
    return {
      id: createdProfile.Id,
      accountId: createdProfile.AccountId,
      billTo: createdProfile.BillTo,
      attention: createdProfile.Attention,
      address1: createdProfile.Address1,
      address2: createdProfile.Address2,
      city: createdProfile.City,
      state: createdProfile.State,
      zip: createdProfile.ZIP || createdProfile.Zip,
      country: createdProfile.Country,
      email: createdProfile.Email,
      currencyCode: createdProfile.CurrencyCode,
      billingCycle: createdProfile.BillingCycle,
      paymentTermDays: parseInt(createdProfile.PaymentTermDays) || 30,
      billingMethod: createdProfile.BillingMethod === 'Electronic Payment' ? 'EMAIL' : 'MAIL',
      invoiceDeliveryMethod: createdProfile.InvoiceDeliveryMethod
    };
  }

  static async createAccountProduct(product: Omit<AccountProduct, 'id'>): Promise<AccountProduct> {
    const response = await apiClient.post('/ACCOUNT_PRODUCT', {
      brmObjects: [{
        AccountId: product.accountId,
        Quantity: '1',
        StartDate: product.startDate,
        EndDate: product.endDate || '',
        ProductId: product.productId,
        Status: 'ACTIVE'
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