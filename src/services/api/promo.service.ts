import { apiClient } from './client';
import { PromoCode } from './types';

export class PromoService {
  static async getPromoCodes(): Promise<PromoCode[]> {
    const query = `
      SELECT 
        Id,
        aaa_Promo_Code_Name,
        aaa_Promo_Code,
        aaa_Promo_Code_Description,
        aaa_Promo_Code_Status
      FROM AAANE_PROMO_CODES
    `;

    const response = await apiClient.get('/query', {
      params: { sql: query }
    });

    return response.data;
  }

  static async addAccountPromoCode(accountId: string, promoCodeId: string) {
    const response = await apiClient.post('/AAANE_ACCOUNT_PROMO_CODES', {
      AccountId: accountId,
      PromoCodeId: promoCodeId,
      AppliedDate: new Date().toISOString()
    });

    return response.data;
  }
}