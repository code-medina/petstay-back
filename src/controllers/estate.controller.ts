import type { NextFunction, Request, Response } from 'express';
import type { EstateService } from '../services/estate.service.js';
import { CreateEstateDto, EditEstateDto } from '../dtos/estate.dto.js';
import { AppError } from '../errors/app.error.js';
import { logger } from '../lib/logger.js';
import { getZodError } from '../lib/zod.js';

export class EstateController {
  private service: EstateService;
  constructor(service: EstateService) {
    this.service = service;
  }
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
      const list = await this.service.listAllEstate();
      return res
        .status(201)
        .json({ ok: true, message: 'successful list', data: list });
    } catch (error) {
      next(error);
    }
  };
}
