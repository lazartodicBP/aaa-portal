import React from 'react';

interface BillingDetailsFormProps {
  formData: {
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    email: string;
  };
  setFormData: (data: any) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export function BillingProfileForm({
                                     formData,
                                     setFormData,
                                     errors,
                                     setErrors
                                   }: BillingDetailsFormProps) {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-semibold mb-4">Contact & Address Details</h3>
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address1" className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="address1"
            value={formData.address1}
            onChange={(e) => handleChange('address1', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
              errors.address1 ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="123 Main Street"
          />
          {errors.address1 && (
            <p className="mt-1 text-sm text-red-600">{errors.address1}</p>
          )}
        </div>

        {/* City and State Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="City"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>
        </div>

        {/* ZIP and Country Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zip"
              value={formData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue ${
                errors.zip ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345"
              maxLength={5}
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-600">{errors.zip}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-aaa-blue border-gray-300"
              placeholder="USA"
              defaultValue="USA"
            />
          </div>
        </div>
      </div>
    </div>
  );
}