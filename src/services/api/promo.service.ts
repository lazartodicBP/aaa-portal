import { apiClient } from './client';
import { PromoCode, AccountPromoCode } from './types';
import { getFormattedDate } from '@/services/utils/utils';

export class PromoService {
  /**
   * Fetch all available promo codes that are enabled for customer service
   */
  static async getAvailablePromoCodes(): Promise<PromoCode[]> {
    try {
      const query = `SELECT Id, 
       aaa_Promo_Code_Name, 
       aaa_Promo_Code 
        FROM AAANE_PROMO_CODES 
        WHERE CustomerServiceEnabled = '1'`;

      const response: any = await apiClient.post('/query', {
        sql: query
      });

      const promoCodes = response.queryResponse || [];
      console.log('Promo codes:', promoCodes);

      return promoCodes.map((promo: any) => ({
        id: promo.Id,
        aaa_Promo_Code_Name: promo.aaa_Promo_Code_Name,
        aaa_Promo_Code: promo.aaa_Promo_Code
      }));
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      throw new Error('Failed to fetch available promo codes');
    }
  }

  /**
   * Add a promo code to an account
   */
  static async addPromoCodeToAccount(
    accountId: string,
    promoCodeId: string
  ): Promise<AccountPromoCode> {
    try {
      const startDate = getFormattedDate(new Date());

      const response: any = await apiClient.post('/AAANE_ACCOUNT_PROMO_CODES', {
        brmObjects: [{
          AccountId: accountId,
          aaa_Promo_Code: promoCodeId,
          aaa_PromoCodeStartDate: startDate,
          aaa_PromoCodeStatus: 'Active'
        }]
      });

      const createdPromoCode = response.createResponse?.[0];

      if (!createdPromoCode || !createdPromoCode.Id) {
        throw new Error('Failed to add promo code: Invalid response');
      }

      // Check for errors in response
      if (createdPromoCode.ErrorCode && createdPromoCode.ErrorCode !== '0') {
        throw new Error(
          createdPromoCode.ErrorText || 'Failed to add promo code'
        );
      }

      return createdPromoCode;
    } catch (error: any) {
      console.error('Failed to add promo code to account:', error);
      throw new Error(error.message || 'Failed to add promo code to account');
    }
  }

  /**
   * Get promo codes for a specific account
   */
  static async getAccountPromoCodes(accountId: string): Promise<AccountPromoCode[]> {
    try {
      const query = `AccountId = '${accountId}'`;

      const response: any = await apiClient.get('/AAANE_ACCOUNT_PROMO_CODES', {
        params: {
          queryAnsiSql: query
        }
      });

      const promoCodes = response.retrieveResponse || [];

      return promoCodes.map((promo: any) => ({
        id: promo.Id,
        AccountId: promo.AccountId,
        aaa_Promo_Code: promo.aaa_Promo_Code,
        aaa_PromoCodeStartDate: promo.aaa_PromoCodeStartDate,
        aaa_PromoCodeStatus: promo.aaa_PromoCodeStatus
      }));
    } catch (error) {
      console.error('Failed to fetch account promo codes:', error);
      return [];
    }
  }

  /**
   * Deactivate a promo code for an account
   */
  static async deactivatePromoCode(promoCodeId: string): Promise<void> {
    try {
      const response: any = await apiClient.put(`/AAANE_ACCOUNT_PROMO_CODES/${promoCodeId}`, {
        brmObjects: {
          Id: promoCodeId,
          aaa_PromoCodeStatus: 'Deactivated'
        }
      });

      if (response.ErrorCode && response.ErrorCode !== '0') {
        throw new Error(response.ErrorText || 'Failed to deactivate promo code');
      }
    } catch (error) {
      console.error('Failed to deactivate promo code:', error);
      throw new Error('Failed to deactivate promo code');
    }
  }
}