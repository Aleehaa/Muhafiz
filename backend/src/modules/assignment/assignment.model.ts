import { z } from 'zod';
import { AssignmentStatus } from '@prisma/client';

export const assignmentStatusSchema = z.nativeEnum(AssignmentStatus);

export const createAssignmentSchema = z.object({
  caseId: z.string().uuid(),
  assignedFsoId: z.string().uuid(),
  assigningUserId: z.string().uuid(),
  status: assignmentStatusSchema.default(AssignmentStatus.ACTIVE),
  notes: z.string().max(1000).optional(),
});

export const updateAssignmentSchema = z.object({
  status: assignmentStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
  acknowledgedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
