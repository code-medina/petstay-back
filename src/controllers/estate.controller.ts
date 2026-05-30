import type { NextFunction, Request, Response } from 'express';
import type { EstateService } from '../services/estate.service.js';
import {
  CreateEstateDto,
  DeleteEstateDto,
  EditEstateDto,
  QueryParamFilter,
} from '../dtos/estate.dto.js';
import{MongoIdSchema} from "../dtos/common.dto.js"
import { AppError } from '../errors/app.error.js';
import { logger } from '../lib/logger.js';
import { getZodError } from '../lib/zod.js';

export class EstateController {
  private service: EstateService;
  constructor(service: EstateService) {
    this.service = service;
  }



  getOneEstate = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('get one estate controller');
    const dto = MongoIdSchema.safeParse(req.params.id);
    if (!dto.success) throw new AppError('Id estate invalid', 400);
    try {
      const estate = await this.service.getEstateById(dto.data);
      return res
        .status(200)
        .json({ ok: true, message: 'successful get one estate', data: estate });
    } catch (error) {
      next(error);
    }
  };
  createEstate = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('create estate controller');

    const user = res.locals.user;
    if (!user) throw new AppError('user not defined', 401);

    try {
      const dtos = CreateEstateDto.safeParse({ ...req.body, owner: user.id });
      if (!dtos.success) {
        const message = getZodError(dtos.error);
        throw new AppError(`Invalid input for estate creation:${message}`, 400);
      }

      const newEstate = await this.service.createEstate(dtos.data);
      return res
        .status(201)
        .json({ ok: true, message: 'successful creation', data: newEstate });
    } catch (error) {
      next(error);
    }
  };

  updateEstate = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('update  estate controller');

    const user = res.locals.user;
    if (!user) throw new AppError('User not defined', 401);
    try {
      const dtos = EditEstateDto.safeParse({ ...req.body, owner: user.id });
      if (!dtos.success) {
        const message = getZodError(dtos.error);
        throw new AppError(`Invalid input for estate update:${message}`, 400);
      }

      const editEstate = await this.service.updateEstate(dtos.data);
      return res
        .status(201)
        .json({ ok: true, message: 'successful update', data: editEstate });
    } catch (error) {
      next(error);
    }
  };

  listEstate = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('List  estate controller');
    try {
      const query = QueryParamFilter.safeParse(req.query);
      if (!query.success) {
        throw new AppError(
          `Bad request query: ${getZodError(query.error)}`,
          400,
        );
      }

      const filters = JSON.parse(JSON.stringify(query.data));
      logger.info(filters);
      const entries = Object.entries(filters);

      logger.info(entries);
      //estate currentPage totalPages
      const data = await this.service.searchFilter(query.data);
      return res.status(200).json({ ok: true, message: entries.length > 2 ? "successful list estate filter " : "success list estate", data });



    } catch (error) {
      next(error);
    }
  };
  deleteEstate = async (req: Request, res: Response, next: NextFunction) => {
    logger.info('DELETE  estate controller');
    const owner = res.locals.user;
    const id = req.params.id;
    const dto = DeleteEstateDto.safeParse({ _id: id, owner: owner.id });
    if (!dto.success) {
      const message = getZodError(dto.error);

      throw new AppError(`id and owner are required: ${message}`);
    }
    try {
      await this.service.deleteEstate(dto.data);
      return res
        .status(201)
        .json({ ok: true, message: 'successful delete', data: dto.data });
    } catch (error) {
      next(error);
    }
  };
}
