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

    // Fix: Correctly access the createResponse array
    const createdAccount = response.createResponse?.[0];

    if (!createdAccount || !createdAccount.Id) {
      throw new Error('Failed to create account: Invalid response');
    }

    // Since createResponse only returns Id, we need to fetch the full account details
    return this.getAccountById(createdAccount.Id);
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

    // Standardized response handling
    const createdProfile = response.createResponse?.[0];

    if (!createdProfile || !createdProfile.Id) {
      throw new Error('Failed to create billing profile: Invalid response');
    }

    // createResponse only returns Id, so fetch full details
    return this.getBillingProfileById(createdProfile.Id);
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

    // Standardized response handling
    const createdProduct = response.createResponse?.[0] || response.brmObjects?.[0];

    if (!createdProduct || !createdProduct.Id) {
      throw new Error('Failed to create account product: Invalid response');
    }

    // If createResponse only has Id, fetch full details
    if (response.createResponse && !createdProduct.AccountId) {
      return this.getAccountProductById(createdProduct.Id);
    }

    return createdProduct;
  }

  static async updateAccountProduct(productId: string, updates: Partial<AccountProduct>): Promise<AccountProduct> {
    const response = await apiClient.patch(`/ACCOUNT_PRODUCT/${productId}`, {
      brmObjects: [updates]
    });

    // Standardized response handling
    const updatedProduct = response.updateResponse?.[0] || response.brmObjects?.[0];

    if (!updatedProduct) {
      throw new Error('Failed to update account product: Invalid response');
    }

    return updatedProduct;
  }

  static async getAccountsByName(accountName: string): Promise<Account[]> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id, Name, Status, AccountTypeId, AccountTypeIdObj.AccountType
            FROM ACCOUNT WHERE UPPER(Name) LIKE UPPER('%${accountName}%')`
    });

    // Standardized response handling - response is already unwrapped by interceptor
    const accounts = response.queryResponse || [];

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
    // First try the REST endpoint
    try {
      const response = await apiClient.get(`/ACCOUNT/${accountId}`);

      // Handle different possible response structures
      const acc = response.retrieveResponse?.[0] || response.brmObjects?.[0] || response;

      if (!acc || !acc.Id) {
        throw new Error('Account not found');
      }

      // Transform to match our interface and include accountType
      return {
        id: acc.Id,
        name: acc.Name,
        status: acc.Status,
        accountTypeId: acc.AccountTypeId || '',
        accountType: acc['AccountTypeIdObj.AccountType'] || acc.AccountType || undefined
      };
    } catch (error) {
      // Fallback to query if REST endpoint fails or doesn't return AccountType
      console.log('Falling back to query for account details');
      const response = await apiClient.post('/query', {
        sql: `SELECT Id, Name, Status, AccountTypeId, AccountTypeIdObj.AccountType FROM ACCOUNT WHERE Id = '${accountId}'`
      });

      const accounts = response.queryResponse || [];

      if (accounts.length === 0) {
        throw new Error('Account not found');
      }

      const acc = accounts[0];

      return {
        id: acc.Id,
        name: acc.Name,
        status: acc.Status,
        accountTypeId: acc.AccountTypeId || '',
        accountType: acc['AccountTypeIdObj.AccountType'] || undefined
      };
    }
  }

  // Get AccountTypeId by AccountType name
  static async getAccountType(accountTypeName: string): Promise<string | null> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id FROM ACCOUNT_TYPE WHERE AccountType = '${accountTypeName}'`
    });

    // Standardized response handling - response is already unwrapped by interceptor
    const accountTypes = response.queryResponse || [];
    console.log("Account types:", accountTypes);

    if (accountTypes.length === 0) {
      console.warn(`AccountType '${accountTypeName}' not found`);
      return null;
    }

    return accountTypes[0].Id;
  }

  private static async getBillingProfileById(profileId: string): Promise<BillingProfile> {
    const response = await apiClient.get(`/BILLING_PROFILE/${profileId}`);

    // Handle the retrieveResponse array structure
    const profile = response.retrieveResponse?.[0];

    if (!profile || !profile.Id) {
      throw new Error('Billing profile not found');
    }

    return {
      id: profile.Id,
      accountId: profile.AccountId,
      billTo: profile.BillTo,
      attention: profile.Attention || '',
      address1: profile.Address1,
      address2: profile.Address2 || '',
      city: profile.City || '',
      state: profile.State || '',
      zip: profile.ZIP || profile.Zip || '',
      country: profile.Country,
      email: profile.Email,
      currencyCode: profile.CurrencyCode,
      billingCycle: profile.BillingCycle,
      paymentTermDays: parseInt(profile.PaymentTermDays) || 30,
      billingMethod: profile.BillingMethod,
      invoiceDeliveryMethod: profile.InvoiceDeliveryMethod,
      hostedPaymentPageExternalId: profile.HostedPaymentPageExternalId || '',
    };
  }

  // Helper method to get account product by ID (new)
  private static async getAccountProductById(productId: string): Promise<AccountProduct> {
    const response = await apiClient.get(`/ACCOUNT_PRODUCT/${productId}`);

    // Handle different possible response structures
    const product = response.retrieveResponse?.[0] || response.brmObjects?.[0] || response;

    if (!product || !product.Id) {
      throw new Error('Account product not found');
    }

    return product;
  }
}