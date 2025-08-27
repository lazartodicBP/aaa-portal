'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useSale } from '@/context/SaleContext';

const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email address'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  }),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export function CustomerForm() {
  const { state, dispatch } = useSale();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: state.customer,
  });

  const onSubmit = (data: CustomerFormData) => {
    dispatch({ type: 'SET_CUSTOMER', payload: data });
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#004B87] mb-6">
          Customer Information
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="1234567890"
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-[#004B87]">Address</h3>
            <Input
              label="Street Address"
              {...register('address.street')}
              error={errors.address?.street?.message}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="City"
                {...register('address.city')}
                error={errors.address?.city?.message}
              />
              <Input
                label="State"
                {...register('address.state')}
                error={errors.address?.state?.message}
                defaultValue="TX"
              />
              <Input
                label="ZIP Code"
                {...register('address.zip')}
                error={errors.address?.zip?.message}
                placeholder="12345"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" variant="primary">
              Continue to Membership Selection
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}