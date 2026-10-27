import { z } from 'zod';

export const createClientCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  code: z
    .string()
    .min(2, 'Company code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Company code must be uppercase alphanumeric (e.g. TCS, LEO_PK)'),
  isActive: z.boolean().default(true),
});

export const updateClientCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/)
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateClientCompanyInput = z.infer<typeof createClientCompanySchema>;
export type UpdateClientCompanyInput = z.infer<typeof updateClientCompanySchema>;
