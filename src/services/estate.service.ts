import type {
  CreateEstateDtoType,
  EditEstateDtoType,
} from '../dtos/estate.dto.js';
import { AppError } from '../errors/app.error.js';
import { logger } from '../lib/logger.js';
import type { IEstateRepository } from '../repositories/estate.repository.js';

export class EstateService {
  private repo: IEstateRepository;
  constructor(repository: IEstateRepository) {
    this.repo = repository;
  }

  createEstate = (dto: CreateEstateDtoType) => {
    logger.info('create estate service');
    try {
      return this.repo.save(dto);
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.error(error);
      throw new AppError('Failed create estate', 400);
    }
  };
  updateEstate = (dto: EditEstateDtoType) => {
    logger.info('Edit estate service');
    try {
      return this.repo.edit(dto);
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError('Failed update');
    }
  };
}
