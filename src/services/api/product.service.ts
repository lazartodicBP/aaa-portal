import { apiClient } from './client';
import { Product, AccountProduct, UpgradeOption } from './types';
import {
  determineBillingCycle,
  determineMembershipLevel,
  getBenefitSet,
  getFormattedDate,
  parsePrice
} from "@/services/utils/utils";

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const query = `Name IN ('Classic Basic Monthly', 'Classic Basic Annual', 'Plus Monthly', 'Plus Annual', 'Premier Monthly', 'Premier Annual')`;

      const response = await apiClient.get('/PRODUCT', {
        params: {
          queryAnsiSql: query
        }
      });

      // Standardized response handling - response is already unwrapped by interceptor
      let products = [];
      if (response.retrieveResponse) {
        products = Array.isArray(response.retrieveResponse)
          ? response.retrieveResponse
          : [response.retrieveResponse];
      }

      return products
        .map((p: any) => ({
          id: p.Id,
          name: p.Name,
          productId: p.Id,
          ratingMethodType: p.RatingMethodId,
          price: parsePrice(p.Rate),
          rate: p.Rate, // Keep original rate string
          subscriptionCycle: determineBillingCycle(p.Name),
          membershipLevel: determineMembershipLevel(p.Name),
          displayName: p.aaa_DisplayName || p.Name,
          productType: p.aaa_ProductType,
          level: p.aaa_Level,
        }))
        .sort((a: any, b: any) => {
          // Sort by level first, then by billing cycle (monthly before annual)
          if (a.level !== b.level) {
            return parseInt(a.level) - parseInt(b.level);
          }
          return a.subscriptionCycle === 'MONTHLY' ? -1 : 1;
        });
    } catch (error) {
      console.error('Failed to get products:', error);
      throw error;
    }
  }

  static async getUpgradeOptions(currentProductName: string): Promise<UpgradeOption[]> {
    const query = `
        SELECT
            Id,
            Original_ProductObj.Name,
            Original_ProductObj.Id,
            Destination_ProductObj.Name,
            Destination_ProductObj.Id
        FROM C_Upgrade_and_Downgrade_Management
        WHERE Original_ProductObj.Name = '${currentProductName}'
    `;

    const response = await apiClient.post('/query', {
      params: { sql: query }
    });

    // Standardized response handling - response is already unwrapped by interceptor
    const results = response.queryResponse || [];
    return results;
  }

  static async getCurrentSubscriptions(accountName: string) {
    const query = `
        SELECT
            a.Id AS AccountId,
            a.Name AS AccountName,
            ap.Id AS AccountProductId,
            ap.Name AS AccountProductName,
            ap.Status AS AccountProductStatus,
            ap.StartDate AS AccountProductStartDate,
            ap.EndDate AS AccountProductEndDate
        FROM ACCOUNT a
                 JOIN ACCOUNT_PRODUCT ap ON a.Id = ap.AccountId
        WHERE upper(a.Name) like upper('%${accountName}%')
    `;

    const response = await apiClient.post('/query', {
      params: { sql: query }
    });

    // Standardized response handling - response is already unwrapped by interceptor
    const results = response.queryResponse || [];
    return results;
  }

  // ========== ACCOUNT PRODUCT FUNCTIONS ==========

  static async createAccountProduct(
    accountId: string,
    product: Product
  ): Promise<AccountProduct> {
    // Get today's date in YYYY-MM-DD format
    const startDate = getFormattedDate(new Date());

    // Get BenefitSet based on membership level
    const benefitSet = getBenefitSet(product.membershipLevel);

    const response = await apiClient.post('/ACCOUNT_PRODUCT', {
      brmObjects: [{
        AccountId: accountId,
        Quantity: '1',
        StartDate: startDate,
        EndDate: '', // No end date for active subscription
        ProductId: product.id,
        Status: 'ACTIVE',
        BenefitSet: benefitSet.toString()
      }]
    });

    // Standardized response handling
    const createdProduct = response.createResponse?.[0];

    if (!createdProduct || !createdProduct.Id) {
      throw new Error('Failed to create account product: Invalid response');
    }

    // If createResponse only has Id, fetch full details
    if (!createdProduct.AccountId) {
      return this.getAccountProductById(createdProduct.Id);
    }

    return createdProduct;
  }

  static async updateAccountProduct(
    productId: string,
    updates: Partial<AccountProduct>
  ): Promise<AccountProduct> {
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

  static async getAccountProductById(productId: string): Promise<AccountProduct> {
    const response = await apiClient.get(`/ACCOUNT_PRODUCT/${productId}`);

    // Handle different possible response structures
    const product = response.retrieveResponse?.[0] || response.brmObjects?.[0] || response;

    if (!product || !product.Id) {
      throw new Error('Account product not found');
    }

    return product;
  }
}