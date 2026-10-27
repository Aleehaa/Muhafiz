import { z } from 'zod';
import { AuditEventType } from '@prisma/client';

export const auditEventTypeSchema = z.nativeEnum(AuditEventType);

export const createAuditEventSchema = z.object({
  caseId: z.string().uuid().optional(),
  actingUserId: z.string().uuid().optional(),
  eventType: auditEventTypeSchema,
  details: z.record(z.unknown()).optional(),
}).refine((data) => {
  // Prevent sensitive information such as password or tokens in audit logs
  if (data.details) {
    const keys = Object.keys(data.details).map((k) => k.toLowerCase());
    const sensitive = ['password', 'passwordhash', 'token', 'secret', 'authorization'];
    return !keys.some((k) => sensitive.includes(k));
  }
  return true;
}, {
  message: 'Audit event details must not contain passwords, secrets, or authorization tokens',
  path: ['details'],
});

export type CreateAuditEventInput = z.infer<typeof createAuditEventSchema>;
