import { apiClient } from './client';
import { Account, BillingProfile } from './types';
import { generateRandomNineDigitNumber, generateMemberID } from "@/services/utils/utils";

export class AccountService {
  static async createAccount(
    name: string,
    options?: {
      firstName?: string;
      lastName?: string;
      middleName?: string;
      memberAcctType?: 'Primary' | 'Associate';
      billFrequency?: 'Monthly' | 'Yearly';
    }
  ): Promise<Account> {
    // Parse names from the account name if not provided
    const nameParts = name.split(' ');
    const firstName = options?.firstName || nameParts[0] || name;
    const lastName = options?.lastName || nameParts.slice(1).join(' ') || name;

    const response = await apiClient.post('/ACCOUNT', {
      brmObjects: [{
        Name: name,
        Status: 'ACTIVE',
        AccountTypeId: '681',  // Account type
        aaa_MemberID: generateMemberID(),
        aaa_MemberAcctType: options?.memberAcctType || "Primary",
        aaa_MemberCardNumber: generateRandomNineDigitNumber().toString(),
        aaa_MemberFirstName: firstName,
        aaa_MemberLastName: lastName,
        aaa_MemberMiddleName: options?.middleName || "0",
        aaa_MemberRenewalMethod: "Autorenew",
        aaa_MembershipBillFrequency: options?.billFrequency || "Monthly"
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

  static async createBillingProfile(
    profile: Pick<BillingProfile, 'accountId' | 'billTo' | 'address1' | 'city' | 'state' | 'zip' | 'country' | 'aaa_Email' | 'email'> & {
      billingCycle?: 'MONTHLY' | 'YEARLY';
    }
  ): Promise<BillingProfile> {
    const response = await apiClient.post('/BILLING_PROFILE', {
      brmObjects: [{
        AccountId: profile.accountId,
        BillTo: profile.billTo,
        Address1: profile.address1,
        City: profile.city || '',
        State: profile.state || '',
        Zip: profile.zip || '',
        Country: profile.country || '',
        aaa_Email: profile.aaa_Email,
        Email: profile.email,
        // Use the billingCycle from the profile if provided, otherwise default to MONTHLY
        BillingCycle: profile.billingCycle,
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

  static async getAccountsByName(accountName: string): Promise<Account[]> {
    const response = await apiClient.post('/query', {
      sql: `SELECT Id, Name, Status, AccountTypeId, AccountTypeIdObj.AccountType,
                   aaa_MemberID, aaa_MemberAcctType, aaa_MemberCardNumber, aaa_MemberFirstName,
                   aaa_MemberLastName, aaa_MemberMiddleName, aaa_MemberRenewalMethod,
                   aaa_MembershipBillFrequency
            FROM ACCOUNT WHERE UPPER(Name) LIKE UPPER('%${accountName}%')`
    });

    // Standardized response handling - response is already unwrapped by interceptor
    const accounts = response.queryResponse || [];

    return accounts.map((acc: any) => ({
      id: acc.Id,
      name: acc.Name,
      status: acc.Status,
      accountTypeId: acc.AccountTypeId || '',
      accountType: acc['AccountTypeIdObj.AccountType'] || '',
      aaa_MemberID: acc.aaa_MemberID || '',
      aaa_MemberAcctType: acc.aaa_MemberAcctType || 'Primary',
      aaa_MemberCardNumber: acc.aaa_MemberCardNumber || '',
      aaa_MemberFirstName: acc.aaa_MemberFirstName || '',
      aaa_MemberLastName: acc.aaa_MemberLastName || '',
      aaa_MemberMiddleName: acc.aaa_MemberMiddleName || '',
      aaa_MemberRenewalMethod: acc.aaa_MemberRenewalMethod || 'Autorenew',
      aaa_MembershipBillFrequency: acc.aaa_MembershipBillFrequency || 'Monthly'
    }));
  }

  // Get account by ID - NO FALLBACK, ONLY REST ENDPOINT
  static async getAccountById(accountId: string): Promise<Account> {
    const response = await apiClient.get(`/ACCOUNT/${accountId}`);

    // Handle different possible response structures
    const acc = response.retrieveResponse?.[0] || response.brmObjects?.[0] || response;

    if (!acc || !acc.Id) {
      throw new Error('Account not found');
    }

    // Transform to match our interface including all AAA fields
    return {
      id: acc.Id,
      name: acc.Name,
      status: acc.Status,
      accountTypeId: acc.AccountTypeId || '',
      accountType: acc['AccountTypeIdObj.AccountType'] || acc.AccountType || '',
      aaa_MemberID: acc.aaa_MemberID || '',
      aaa_MemberAcctType: acc.aaa_MemberAcctType || '',
      aaa_MemberCardNumber: acc.aaa_MemberCardNumber || '',
      aaa_MemberFirstName: acc.aaa_MemberFirstName || '',
      aaa_MemberLastName: acc.aaa_MemberLastName || '',
      aaa_MemberMiddleName: acc.aaa_MemberMiddleName || '',
      aaa_MemberRenewalMethod: acc.aaa_MemberRenewalMethod || '',
      aaa_MembershipBillFrequency: acc.aaa_MembershipBillFrequency || ''
    };
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
      aaa_Email: profile.aaa_Email,
      email: profile.Email,
      currencyCode: profile.CurrencyCode,
      billingCycle: profile.BillingCycle,
      paymentTermDays: parseInt(profile.PaymentTermDays) || 30,
      billingMethod: profile.BillingMethod,
      invoiceDeliveryMethod: profile.InvoiceDeliveryMethod,
      hostedPaymentPageExternalId: profile.HostedPaymentPageExternalId || '',
    };
  }
}