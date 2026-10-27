-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT_USER', 'CRO', 'SFSO', 'FSO');

-- CreateEnum
CREATE TYPE "CaseIssueType" AS ENUM ('CUSTOMER_ISSUE', 'FAKE_DELIVERY', 'SNATCHING', 'THEFT', 'OTHER');

-- CreateEnum
CREATE TYPE "CaseCity" AS ENUM ('KARACHI', 'LAHORE', 'RAWALPINDI', 'ISLAMABAD');

-- CreateEnum
CREATE TYPE "CaseSource" AS ENUM ('CLIENT_PORTAL', 'CRO_LOGGED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('SUBMITTED', 'ACKNOWLEDGED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED', 'ON_HOLD', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'REASSIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('CASE_CREATED', 'CASE_ACKNOWLEDGED', 'CASE_ASSIGNED', 'CASE_REASSIGNED', 'CASE_STATUS_UPDATED', 'FIELD_REPORT_SUBMITTED', 'EVIDENCE_UPLOADED', 'NOTE_ADDED', 'USER_LOGIN', 'USER_LOGOUT', 'SYSTEM_EVENT');

-- CreateTable
CREATE TABLE "client_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientCompanyId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "publicCaseId" TEXT,
    "clientCompanyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "issueType" "CaseIssueType" NOT NULL,
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "city" "CaseCity" NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT,
    "trackingNumber" TEXT,
    "amountAtStake" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "source" "CaseSource" NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "assignedFsoId" TEXT NOT NULL,
    "assigningUserId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "caseId" TEXT,
    "actingUserId" TEXT,
    "eventType" "AuditEventType" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_companies_code_key" ON "client_companies"("code");

-- CreateIndex
CREATE INDEX "client_companies_code_idx" ON "client_companies"("code");

-- CreateIndex
CREATE INDEX "client_companies_isActive_idx" ON "client_companies"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_clientCompanyId_idx" ON "users"("clientCompanyId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "cases_publicCaseId_key" ON "cases"("publicCaseId");

-- CreateIndex
CREATE INDEX "cases_publicCaseId_idx" ON "cases"("publicCaseId");

-- CreateIndex
CREATE INDEX "cases_clientCompanyId_idx" ON "cases"("clientCompanyId");

-- CreateIndex
CREATE INDEX "cases_createdById_idx" ON "cases"("createdById");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_city_idx" ON "cases"("city");

-- CreateIndex
CREATE INDEX "cases_issueType_idx" ON "cases"("issueType");

-- CreateIndex
CREATE INDEX "cases_trackingNumber_idx" ON "cases"("trackingNumber");

-- CreateIndex
CREATE INDEX "cases_incidentDate_idx" ON "cases"("incidentDate");

-- CreateIndex
CREATE INDEX "assignments_caseId_idx" ON "assignments"("caseId");

-- CreateIndex
CREATE INDEX "assignments_assignedFsoId_idx" ON "assignments"("assignedFsoId");

-- CreateIndex
CREATE INDEX "assignments_assigningUserId_idx" ON "assignments"("assigningUserId");

-- CreateIndex
CREATE INDEX "assignments_status_idx" ON "assignments"("status");

-- CreateIndex
CREATE INDEX "audit_events_caseId_idx" ON "audit_events"("caseId");

-- CreateIndex
CREATE INDEX "audit_events_actingUserId_idx" ON "audit_events"("actingUserId");

-- CreateIndex
CREATE INDEX "audit_events_eventType_idx" ON "audit_events"("eventType");

-- CreateIndex
CREATE INDEX "audit_events_createdAt_idx" ON "audit_events"("createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "client_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_clientCompanyId_fkey" FOREIGN KEY ("clientCompanyId") REFERENCES "client_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assignedFsoId_fkey" FOREIGN KEY ("assignedFsoId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assigningUserId_fkey" FOREIGN KEY ("assigningUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actingUserId_fkey" FOREIGN KEY ("actingUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
