import { Router } from "express";
import { UserRepository } from "../repositories/user.repository.js";
import { UserService } from "../services/user.service.js";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { authorizeMiddleware } from "../middlewares/authorize.middleware.js"

const repo = new UserRepository();
const service = new UserService(repo);
const controller = new UserController(service);

//routes
export const userRouter: Router = Router();
userRouter.get("/users/me",
    authMiddleware,
    controller.getMe);
    //tenant
userRouter.get("/users/me/favorites",
    authMiddleware,
    authorizeMiddleware(["tenant"]),
    controller.getMeFavorites);
userRouter.post("/users/me/favorites",
    authMiddleware,
    authorizeMiddleware(["tenant"]),
    controller.createFavorite);
userRouter.delete("/users/me/favorites/:_id",
    authMiddleware,
    authorizeMiddleware(["tenant"]),
    controller.deleteFavorite);
    
//landlord
userRouter.get("/users/me/estates",
    authMiddleware,
    authorizeMiddleware(["landlord"]),
    controller.getMeEstates);