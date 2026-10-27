import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { UserRole, CaseIssueType, CaseCity, CaseSource, CaseStatus } from '@prisma/client';
import { createUserSchema } from '../src/modules/user/user.model';
import { createCaseSchema } from '../src/modules/case/case.model';
import { createAuditEventSchema } from '../src/modules/audit/audit.model';
import { ClientCompanyRepository } from '../src/modules/client-company/client-company.repository';
import { ClientCompanyService } from '../src/modules/client-company/client-company.service';
import { prisma } from '../src/database/prisma';

describe('Domain Models & Validation Schemas', () => {
  describe('User Validation', () => {
    test('CLIENT_USER must have a clientCompanyId', () => {
      const invalidClientUser = {
        fullName: 'Client Rep',
        email: 'client@example.com',
        password: 'securePassword123',
        role: UserRole.CLIENT_USER,
        isActive: true,
      };
      const result = createUserSchema.safeParse(invalidClientUser);
      assert.equal(result.success, false);

      const validClientUser = {
        ...invalidClientUser,
        clientCompanyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };
      const validResult = createUserSchema.safeParse(validClientUser);
      assert.equal(validResult.success, true);
    });

    test('Internal staff (CRO, SFSO, FSO) must not have a clientCompanyId', () => {
      const invalidCro = {
        fullName: 'CRO Staff',
        email: 'cro@mohafiz.com',
        password: 'securePassword123',
        role: UserRole.CRO,
        clientCompanyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      };
      const croResult = createUserSchema.safeParse(invalidCro);
      assert.equal(croResult.success, false);

      const validCro = {
        fullName: 'CRO Staff',
        email: 'cro@mohafiz.com',
        password: 'securePassword123',
        role: UserRole.CRO,
      };
      assert.equal(createUserSchema.safeParse(validCro).success, true);
    });
  });

  describe('Case Validation', () => {
    test('validates case fields, city, and non-negative amount at stake', () => {
      const validCase = {
        clientCompanyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        createdById: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        issueType: CaseIssueType.THEFT,
        incidentDate: new Date('2026-10-14'),
        city: CaseCity.KARACHI,
        area: 'Gulshan-e-Iqbal Block 13-D',
        amountAtStake: 45000,
        description: 'Consignment snatched near delivery hub at gunpoint.',
        source: CaseSource.CLIENT_PORTAL,
        status: CaseStatus.SUBMITTED,
      };

      const result = createCaseSchema.safeParse(validCase);
      assert.equal(result.success, true);

      const invalidNegativeAmount = {
        ...validCase,
        amountAtStake: -100,
      };
      assert.equal(createCaseSchema.safeParse(invalidNegativeAmount).success, false);
    });
  });

  describe('AuditEvent Security Validation', () => {
    test('rejects audit records containing sensitive fields like password or token', () => {
      const insecureAudit = {
        eventType: 'USER_LOGIN',
        details: {
          username: 'officer1',
          password: 'plainPassword123',
        },
      };
      const result = createAuditEventSchema.safeParse(insecureAudit);
      assert.equal(result.success, false);

      const secureAudit = {
        eventType: 'USER_LOGIN',
        details: {
          username: 'officer1',
          ipAddress: '192.168.1.1',
          userAgent: 'MohafizWeb/1.0',
        },
      };
      assert.equal(createAuditEventSchema.safeParse(secureAudit).success, true);
    });
  });

  describe('ClientCompany Repository Database Integration', () => {
    const testCode = `TEST_${Date.now()}`;
    let createdId: string;

    test('creates, reads, and updates a client company in PostgreSQL', async () => {
      // Create via Repository
      const created = await ClientCompanyRepository.create({
        name: 'Express Logistics Pakistan',
        code: testCode,
        isActive: true,
      });

      assert.ok(created.id);
      assert.equal(created.code, testCode);
      assert.equal(created.name, 'Express Logistics Pakistan');
      createdId = created.id;

      // Find by ID
      const foundById = await ClientCompanyRepository.findById(createdId);
      assert.ok(foundById);
      assert.equal(foundById?.code, testCode);

      // Find by Code
      const foundByCode = await ClientCompanyRepository.findByCode(testCode);
      assert.ok(foundByCode);
      assert.equal(foundByCode?.id, createdId);

      // Update
      const updated = await ClientCompanyRepository.update(createdId, {
        name: 'Express Logistics PK (Pvt) Ltd',
      });
      assert.equal(updated.name, 'Express Logistics PK (Pvt) Ltd');

      // Duplicate code rejection in Service
      await assert.rejects(
        async () => {
          await ClientCompanyService.createCompany({
            name: 'Another Company',
            code: testCode,
          });
        },
        {
          name: 'AppError',
          message: `Company with code '${testCode}' already exists`,
        }
      );

      // Clean up test record
      await ClientCompanyRepository.delete(createdId);
      const afterDelete = await ClientCompanyRepository.findById(createdId);
      assert.equal(afterDelete, null);
    });

    test.after(async () => {
      await prisma.$disconnect();
    });
  });
});
