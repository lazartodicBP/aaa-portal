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


  static async getProductById(productId: string): Promise<Product> {
    try {
      const response = await apiClient.get(`/PRODUCT/${productId}`);

      console.log("Product response:", response);
      // Standardized response handling
      const productData = response.retrieveResponse[0] || response;

      if (!productData || !productData.Id) {
        throw new Error('Product not found');
      }

      return {
        id: productData.Id,
        name: productData.Name,
        productId: productData.Id,
        ratingMethodType: productData.RatingMethodId,
        price: parsePrice(productData.Rate),
        rate: productData.Rate, // Keep original rate string
        subscriptionCycle: determineBillingCycle(productData.Name),
        membershipLevel: determineMembershipLevel(productData.Name),
        displayName: productData.aaa_DisplayName || productData.Name,
        productType: productData.aaa_ProductType,
        level: productData.aaa_Level,
      } as Product;
    } catch (error) {
      console.error(`Failed to get product by ID (${productId}):`, error);
      throw error;
    }
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
    updates: any
  ): Promise<AccountProduct> {
    // Use PUT method as per API docs, not PATCH
    const response = await apiClient.put(`/ACCOUNT_PRODUCT/${productId}`, {
      brmObjects: updates  // Send as object, not array
    });

    // Handle the response structure
    const result = response.upsertResponse?.[0] || response.updateResponse?.[0] || response.brmObjects || response;

    if (!result) {
      throw new Error('Failed to update account product: Invalid response');
    }

    // Check for errors in the response
    if (result.ErrorCode && result.ErrorCode !== '0') {
      throw new Error(`Failed to update account product: ${result.ErrorText || 'Unknown error'} (Field: ${result.ErrorElementField})`);
    }

    // Check if it created a new record instead of updating
    if (result.created === 'true' || result.created === true) {
      console.warn(`Warning: Update request created a new record with ID ${result.Id} instead of updating ${productId}`);
    }

    // If response only has Id and status info, fetch full details
    if (result.Id && !result.AccountId) {
      return this.getAccountProductById(result.Id);
    }

    return result;
  }

  static async getAccountProductById(productId: string): Promise<AccountProduct> {
    const response = await apiClient.get(`/ACCOUNT_PRODUCT/${productId}`);

    // Handle different possible response structures
    const accountProduct = response.retrieveResponse?.[0] || response.brmObjects?.[0] || response;

    if (!accountProduct || !accountProduct.Id) {
      throw new Error('Account product not found');
    }

    return {
      id: accountProduct.Id,
      name: accountProduct.Name,
      accountId:accountProduct.AccountId,
      productId: accountProduct.ProductId,
      startDate: accountProduct.StartDate,
      endDate: accountProduct.EndDate,
      status: accountProduct.Status,
      benefitSet: accountProduct.BenefitSet,
      quantity: parseInt(accountProduct.Quantity) || 1,
      rate: accountProduct.Rate,
      renewalDate: accountProduct.RenewalDate,
      ratingMethodId: accountProduct.RatingMethodId,
    } as AccountProduct;
  }

  // Get Account Products by Account ID
  static async getAccountProductsByAccountId(accountId: string): Promise<AccountProduct[]> {
    const query = `AccountId = '${accountId}'`;
    const response = await apiClient.get('/ACCOUNT_PRODUCT', {
      params: {
        queryAnsiSql: query
      }
    });

    const products: any = response.retrieveResponse || [];

    return products.map((product: any) => ({
      id: product.Id,
      name: product.Name,
      accountId:product.AccountId,
      productId: product.ProductId,
      startDate: product.StartDate,
      endDate: product.EndDate,
      status: product.Status,
      benefitSet: product.BenefitSet,
      quantity: parseInt(product.Quantity) || 1,
      rate: product.Rate,
      renewalDate: product.RenewalDate,
      ratingMethodId: product.RatingMethodId,
    } as AccountProduct));
  }
}