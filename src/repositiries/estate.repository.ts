import type { CreateEstateDtoType } from "../dtos/estate.dto.js";
import { Estate, type IEstate } from "../models/estate.model.js";
 export interface IEstateRepository{
    save(dto:CreateEstateDtoType):Promise<IEstate>;
 }
 export class EstateRepository implements IEstateRepository{

     save(dto: CreateEstateDtoType): Promise<IEstate> {
         return Estate.create(dto);
     }

 }