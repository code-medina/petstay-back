import type { NextFunction, Request, Response } from 'express';
import type { EstateService } from '../services/estate.service.js';
import { CreateEstateDto } from '../dtos/estate.dto.js';
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
    try {
      const dtos = CreateEstateDto.safeParse(req.body);
      if (!dtos.success) {
        const message=getZodError(dtos.error);
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
}
