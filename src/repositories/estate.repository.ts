import type {
  CreateEstateDtoType,
  EditEstateDtoType,
} from '../dtos/estate.dto.js';
import { AppError } from '../errors/app.error.js';
import { Estate, type IEstate } from '../models/estate.model.js';
import { logger } from '../lib/logger.js';

export interface IEstateRepository {
  save(dto: CreateEstateDtoType): Promise<IEstate>;
  edit(dto: EditEstateDtoType): Promise<IEstate>;
}
export class EstateRepository implements IEstateRepository {
  save(parsedDto: CreateEstateDtoType): Promise<IEstate> {
    const dto = JSON.parse(JSON.stringify(parsedDto));
    return Estate.create(dto);
  }
  async edit(parsedDto: EditEstateDtoType): Promise<IEstate> {
    logger.info(' update estate repository');
    const dtoWithoutUndefined = JSON.parse(JSON.stringify(parsedDto));
    const { _id: userId, ...dto } = dtoWithoutUndefined;
    try {
      // findByIdAndUpdate only updates the fields present in 'updates'
      const updateEstate = await Estate.findByIdAndUpdate(
        userId,
        { $set: dto }, // $set ensures only specific fields are modified
        { new: true, runValidators: true }, // 'new: true' returns the updated doc
      );
      if (!updateEstate) throw new AppError('Estate Not found', 404);
      return updateEstate;
    } catch (error) {
      logger.error(error);

      if (error instanceof AppError) throw error;

      throw new AppError('Failed update', 500);
    }
  }
}
