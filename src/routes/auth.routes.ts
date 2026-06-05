//modules
import { Router } from 'express';

//controller
import { AuthController } from '../controllers/auth.controller.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { AuthService } from '../services/auth.service.js';
import { SessionService } from '../services/session.service.js';
import { SessionRepository } from '../repositories/session.repository.js';

const repo = new AuthRepository();
const serviceSession = new SessionService(new SessionRepository());
const service = new AuthService(repo, serviceSession);
const authController = new AuthController(service);
export const authRouter: Router = Router();
// register
authRouter.post('/auth/register/:role', authController.registerUser);
// login
authRouter.post('/auth/login', authController.loginUser);
//logout
authRouter.get('/auth/logout', authController.logoutUser);
//refresh
authRouter.get('/auth/refresh', authController.refreshUser);
