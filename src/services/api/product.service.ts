import { apiClient } from './client';
import { Product, UpgradeOption } from './types';

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const query = `Name IN ('Classic Basic Monthly', 'Plus Monthly', 'Premier Monthly')`;

      const response = await apiClient.get('/PRODUCT', {
        params: {
          queryAnsiSql: query
        }
      });

      if (response.data.retrieveResponse) {
        const products = Array.isArray(response.data.retrieveResponse)
          ? response.data.retrieveResponse
          : [response.data.retrieveResponse];

        return products
          .map((p: any)  => ({
            id: p.Id,
            name: p.Name,
            productId: p.Id,
            ratingMethodType: p.RatingMethodId,
            price: this.parsePrice(p.Rate),
            rate: p.Rate, // Keep original rate string
            billingCycle: 'MONTHLY' as const,
            membershipLevel: this.determineMembershipLevel(p.Name),
            displayName: p.aaa_DisplayName || p.Name,
            productType: p.aaa_ProductType,
            level: p.aaa_Level,
          }))
          .sort((a: any, b: any) => parseInt(a.level) - parseInt(b.level));
      }

      return [];
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

    const response = await apiClient.get('/query', {
      params: { sql: query }
    });

    return response.data;
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

    const response = await apiClient.get('/query', {
      params: { sql: query }
    });

    return response.data;
  }

  private static parsePrice(rate: string): number {
    // Remove $ and parse to float
    return parseFloat(rate.replace('$', '')) || 0;
  }

  private static determineMembershipLevel(productName: string): 'CLASSIC' | 'PLUS' | 'PREMIER' {
    const name = productName.toLowerCase();
    if (name.includes('premier')) return 'PREMIER';
    if (name.includes('plus')) return 'PLUS';
    return 'CLASSIC';
  }
}