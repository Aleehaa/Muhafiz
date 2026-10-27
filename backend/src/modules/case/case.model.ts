import { z } from 'zod';
import { CaseIssueType, CaseCity, CaseSource, CaseStatus } from '@prisma/client';

export const caseIssueTypeSchema = z.nativeEnum(CaseIssueType);
export const caseCitySchema = z.nativeEnum(CaseCity);
export const caseSourceSchema = z.nativeEnum(CaseSource);
export const caseStatusSchema = z.nativeEnum(CaseStatus);

export const createCaseSchema = z.object({
  clientCompanyId: z.string().uuid(),
  createdById: z.string().uuid(),
  issueType: caseIssueTypeSchema,
  incidentDate: z.coerce.date(),
  city: caseCitySchema,
  area: z.string().min(2, 'Area must be at least 2 characters').max(200),
  address: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  amountAtStake: z.number().min(0, 'Amount must be non-negative').default(0),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  source: caseSourceSchema,
  status: caseStatusSchema.default(CaseStatus.SUBMITTED),
});

export const updateCaseSchema = z.object({
  publicCaseId: z.string().max(50).optional(),
  issueType: caseIssueTypeSchema.optional(),
  incidentDate: z.coerce.date().optional(),
  city: caseCitySchema.optional(),
  area: z.string().min(2).max(200).optional(),
  address: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  amountAtStake: z.number().min(0).optional(),
  description: z.string().min(10).optional(),
  status: caseStatusSchema.optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
