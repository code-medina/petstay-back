//modules
import { Router } from 'express';

//controller
import { AuthController } from '../controllers/auth.controller.js';
import { AuthRepository } from '../repositiries/auth.repository.js';
import { AuthService } from '../services/auth.service.js';

const repo = new AuthRepository();
const service = new AuthService(repo);
const authController = new AuthController(service);
export const authRouter: Router = Router();
// register
authRouter.post('/auth/register/:role', authController.registerUser);
// login
authRouter.post("/auth/login",authController.loginUser)
