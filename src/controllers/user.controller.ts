import type { NextFunction, Response, Request } from "express";
import type { UserService } from "../services/user.service.js";
import { AppError } from "../errors/app.error.js";

export class UserController {
    private service: UserService;
    constructor(service: UserService) {
        this.service = service;
    }

    getMe =async  (_req: Request, res: Response, nextFunction: NextFunction)=>{
        try {
            const userLocals = res.locals.user;
            if (!userLocals) throw new AppError("user not defined", 401);
            const infoBasicMe = await this.service.showBasicInfo(userLocals.id);
            return res.status(200).json({ ok: true, message: "successful show info", data: infoBasicMe })
        } catch (error) {
            if (error instanceof AppError) throw error;
            nextFunction(error);
        }
    }
}