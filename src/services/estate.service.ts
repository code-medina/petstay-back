import type {
  CreateEstateDtoType,
  DeleteEstateDtoType,
  EditEstateDtoType,
  MongoIdSchemaType,
} from '../dtos/estate.dto.js';
import { AppError } from '../errors/app.error.js';
import { logger } from '../lib/logger.js';
import type { IEstateRepository } from '../repositories/estate.repository.js';

export class EstateService {
  private repo: IEstateRepository;
  constructor(repository: IEstateRepository) {
    this.repo = repository;
  }

   getEstateById=async(dto:MongoIdSchemaType)=>{
    logger.info("get one estate service");
    try {
      const estate=await this.repo.oneById(dto);
      if(!estate) throw new AppError("Not found estate",404);
      return estate;
    } catch (error) {
      logger.error(error);
      if(error instanceof AppError) throw error;
      throw new AppError("Failed get one estate by id",500);
      
    }
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

      logger.error(error);
      throw new AppError('Failed update');
    }
  };
  listAllEstate = () => {
    logger.info('List all estate');
    try {
      return this.repo.list();
    } catch (error) {
      logger.error(error);
      throw new AppError('Failed List all estates');
    }
  };

  deleteEstate = (dto: DeleteEstateDtoType) => {
    logger.info('delete estate');
    try {
      return this.repo.remove(dto);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error(error);
      throw new AppError('Failed delete estate');
    }
  };
}
