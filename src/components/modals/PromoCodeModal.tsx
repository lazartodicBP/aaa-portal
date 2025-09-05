import React, { useState, useEffect } from 'react';
import { PromoService } from '@/services/api/promo.service';
import { PromoCode } from '@/services/api/types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { X, Tag, Check } from 'lucide-react';

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess?: () => void;
}

export function PromoCodeModal({ isOpen, onClose, accountId, onSuccess }: PromoCodeModalProps) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [selectedPromoCode, setSelectedPromoCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPromoCodes();
    } else {
      // Reset state when modal closes
      setSelectedPromoCode('');
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const codes = await PromoService.getAvailablePromoCodes();
      setPromoCodes(codes);
    } catch (err) {
      console.error('Failed to load promo codes:', err);
      setError('Failed to load available promo codes');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromoCode = async () => {
    if (!selectedPromoCode) {
      setError('Please select a promo code');
      return;
    }

    try {
      setApplying(true);
      setError(null);

      await PromoService.addPromoCodeToAccount(accountId, selectedPromoCode);

      setSuccess(true);

      // Show success message briefly then close
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error('Failed to apply promo code:', err);
      setError(err.message || 'Failed to apply promo code');
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center">
            <Tag className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold">Add Promo Code</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {error && (
            <Alert variant="error" message={error} className="mb-4" />
          )}

          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900">Promo Code Applied!</p>
              <p className="text-sm text-gray-600 mt-2">The promo code has been successfully added to the account.</p>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                </div>
              ) : (
                <div>
                  <label htmlFor="promo-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select a promo code
                  </label>
                  <select
                    id="promo-select"
                    value={selectedPromoCode}
                    onChange={(e) => setSelectedPromoCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    disabled={applying}
                  >
                    <option value="">Choose a promo code...</option>
                    {promoCodes.map((promo) => (
                      <option key={promo.id} value={promo.id}>
                        {promo.aaa_Promo_Code_Name} ({promo.aaa_Promo_Code})
                      </option>
                    ))}
                  </select>

                  {selectedPromoCode && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <span className="font-semibold">Selected:</span>{' '}
                        {promoCodes.find(p => p.id === selectedPromoCode)?.aaa_Promo_Code_Name}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Code: {promoCodes.find(p => p.id === selectedPromoCode)?.aaa_Promo_Code}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 px-5 py-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyPromoCode}
              disabled={!selectedPromoCode || applying || loading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {applying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Applying...
                </>
              ) : (
                'Add Promo Code'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}