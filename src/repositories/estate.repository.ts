import type { QueryFilter } from "mongoose";
import type {
  MongoIdSchemaType,
  CreateEstateDtoType,
  DeleteEstateDtoType,
  EditEstateDtoType,
  QueryParamFilterType,
} from '../dtos/estate.dto.js';
import { AppError } from '../errors/app.error.js';
import { Estate, type IEstate } from '../models/estate.model.js';
import { logger } from '../lib/logger.js';



export interface IEstateRepository {
  findFilter(dto: QueryParamFilterType): Promise<IEstate[]>;
  findByAdress(address: string): Promise<IEstate[]>;
  oneById(dto: MongoIdSchemaType): Promise<IEstate | null>;
  remove(dto: DeleteEstateDtoType): Promise<void>;
  list(): Promise<IEstate[]>;
  save(dto: CreateEstateDtoType): Promise<IEstate>;
  edit(dto: EditEstateDtoType): Promise<IEstate>;
}



export class EstateRepository implements IEstateRepository {
  findFilter(dto: QueryParamFilterType): Promise<IEstate[]> {
    const filter: QueryFilter<IEstate> = {};
    if(dto.animalAllowed)
    {
      if(filter.animalAllowed)
      filter.animalAllowed={$all:[...dto.animalAllowed]};
    }

    if(dto.availabilityFor)
    {
      filter.availabily.$gte=dto.availabilityFor;
    }
    if (dto.address) {
      filter.$or = [
        { "address.city": { $regex: dto.address, $options: "i" } },
        { "address.state": { $regex: dto.address, $options: "i" } },
        { "address.country": { $regex: dto.address, $options: "i" } },
        { "address.street": { $regex: dto.address, $options: "i" } },
        { "address.zone": { $regex: dto.address, $options: "i" } },
      ];
    }

    if (dto.minPrice || dto.maxPrice) {
      filter.price = {};

      if (dto.minPrice !== undefined) {
        filter.price.$gte = dto.minPrice;
      }

      if (dto.maxPrice !== undefined) {
        filter.price.$lte = dto.maxPrice;
      }
    }

    return Estate.find(filter);
  }
  findByAdress(address: string): Promise<IEstate[]> {
    return Estate.find({
      $or: [
        { 'address.city': address },
        { 'address.state': address },
        { 'address.country': address },
        { 'address.street': address },
        { 'address.zone': address },
      ],
    });
  }
  oneById(dto: MongoIdSchemaType): Promise<IEstate | null> {
    return Estate.findById(dto);
  }
  async remove(dto: DeleteEstateDtoType): Promise<void> {
    try {
      const estate = await Estate.findOneAndDelete({
        _id: dto._id,
        owner: dto.owner,
      });
      if (!estate) throw new AppError('Estate not Found', 404);
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.error(error);
      throw new AppError('Error during deletion');
    }
  }
  list() {
    return Estate.find({});
  }
  save(parsedDto: CreateEstateDtoType): Promise<IEstate> {
    const dto = JSON.parse(JSON.stringify(parsedDto));
    return Estate.create(dto);
  }
  async edit(parsedDto: EditEstateDtoType): Promise<IEstate> {
    logger.info(' update estate repository');
    const dtoWithoutUndefined = JSON.parse(JSON.stringify(parsedDto));
    const { _id, owner, ...data } = dtoWithoutUndefined;
    try {
      // findByIdAndUpdate only updates the fields present in 'updates'
      const updateEstate = await Estate.findOneAndUpdate(
        {
          _id,
          owner,
        },
        data,
        { new: true, runValidators: true },
      );
      /*   const updateEstate = await Estate.findByIdAndUpdate(
        userId,
        { $set: dto }, // $set ensures only specific fields are modified
        { new: true, runValidators: true }, // 'new: true' returns the updated doc
      ); */
      if (!updateEstate) throw new AppError('Estate Not found', 404);
      return updateEstate;
    } catch (error) {
      logger.error(error);

      if (error instanceof AppError) throw error;

      throw new AppError('Error during updating', 500);
    }
  }
}
