import { Router } from "express";
import { UserRepository } from "../repositories/user.repository.js";
import { UserService } from "../services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"

const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);
export const userRouter: Router = Router();
userRouter.get("/users/me", authMiddleware, controller.getMe);