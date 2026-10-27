import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const userRoleSchema = z.nativeEnum(UserRole);

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(150),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: userRoleSchema,
  clientCompanyId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // If role is CLIENT_USER, clientCompanyId should be provided
    if (data.role === UserRole.CLIENT_USER) {
      return !!data.clientCompanyId;
    }
    // If role is internal staff (CRO, SFSO, FSO), clientCompanyId should not be set
    return !data.clientCompanyId;
  },
  {
    message: 'Client users must have a clientCompanyId, while internal staff (CRO, SFSO, FSO) must not belong to a client company',
    path: ['clientCompanyId'],
  }
);

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  email: z.string().email().max(150).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  clientCompanyId: z.string().uuid().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
