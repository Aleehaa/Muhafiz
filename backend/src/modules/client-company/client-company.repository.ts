import { prisma } from '../../database/prisma';
import { ClientCompany } from '@prisma/client';
import { CreateClientCompanyInput, UpdateClientCompanyInput } from './client-company.model';

export class ClientCompanyRepository {
  public static async create(data: CreateClientCompanyInput): Promise<ClientCompany> {
    return prisma.clientCompany.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        isActive: data.isActive ?? true,
      },
    });
  }

  public static async findById(id: string): Promise<ClientCompany | null> {
    return prisma.clientCompany.findUnique({
      where: { id },
    });
  }

  public static async findByCode(code: string): Promise<ClientCompany | null> {
    return prisma.clientCompany.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
  }

  public static async list(filter?: { isActive?: boolean }): Promise<ClientCompany[]> {
    return prisma.clientCompany.findMany({
      where: filter?.isActive !== undefined ? { isActive: filter.isActive } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  public static async update(
    id: string,
    data: UpdateClientCompanyInput
  ): Promise<ClientCompany> {
    return prisma.clientCompany.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });
  }

  public static async delete(id: string): Promise<ClientCompany> {
    return prisma.clientCompany.delete({
      where: { id },
    });
  }
}
