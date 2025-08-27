import { apiClient } from './client';
import { Product, UpgradeOption } from './types';

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    const query = `
      Name IN ('Classic Basic Monthly', 'Plus Monthly', 'Premier Monthly')
    `;

    const response = await apiClient.get('/PRODUCT', {
      params: { queryAnsiSql: query }
    });

    return response.data.retrieveResponse;
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
}