import { ClientCompanyRepository } from './client-company.repository';
import { CreateClientCompanyInput, UpdateClientCompanyInput } from './client-company.model';
import { ClientCompany } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

export class ClientCompanyService {
  public static async createCompany(input: CreateClientCompanyInput): Promise<ClientCompany> {
    const existing = await ClientCompanyRepository.findByCode(input.code);
    if (existing) {
      throw new AppError(`Company with code '${input.code}' already exists`, 409);
    }

    return ClientCompanyRepository.create(input);
  }

  public static async getCompanyById(id: string): Promise<ClientCompany> {
    const company = await ClientCompanyRepository.findById(id);
    if (!company) {
      throw new AppError(`Company with ID '${id}' not found`, 404);
    }
    return company;
  }

  public static async getCompanyByCode(code: string): Promise<ClientCompany> {
    const company = await ClientCompanyRepository.findByCode(code);
    if (!company) {
      throw new AppError(`Company with code '${code}' not found`, 404);
    }
    return company;
  }

  public static async listCompanies(filter?: { isActive?: boolean }): Promise<ClientCompany[]> {
    return ClientCompanyRepository.list(filter);
  }

  public static async updateCompany(
    id: string,
    input: UpdateClientCompanyInput
  ): Promise<ClientCompany> {
    await this.getCompanyById(id);

    if (input.code) {
      const existing = await ClientCompanyRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new AppError(`Company code '${input.code}' is already in use by another company`, 409);
      }
    }

    return ClientCompanyRepository.update(id, input);
  }
}
