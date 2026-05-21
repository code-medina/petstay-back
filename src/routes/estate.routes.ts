import { Router } from 'express';
import { EstateController } from '../controllers/estate.controller.js';
import { EstateService } from '../services/estate.service.js';
import { EstateRepository } from '../repositories/estate.repository.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeMiddleware } from '../middlewares/authorize.middleware.js';

export const estateRouter: Router = Router();
const repo = new EstateRepository();
const service = new EstateService(repo);
const controller = new EstateController(service);
//create estate
estateRouter.post(
  '/estate',
  authMiddleware,
  authorizeMiddleware(['landlord']),
  controller.createEstate,
);

//edit estate
estateRouter.patch(
  '/estate',
  authMiddleware,
  authorizeMiddleware(['landlord']),
  controller.updateEstate,
);
estateRouter.get('/estate', controller.listEstate);

estateRouter.delete(
  '/estate/:id',
  authMiddleware,
  authorizeMiddleware(['landlord']),
  controller.deleteEstate,
);
