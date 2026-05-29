import type { NextFunction, Response, Request } from "express";
import type { UserService } from "../services/user.service.js";
import { AppError } from "../errors/app.error.js";
import { logger } from "../lib/logger.js";
import { ObjectIdSchema } from "../dtos/common.dto.js";
import { getZodError } from "../lib/zod.js";

export class UserController {
    getMeEstates = async (_req: Request, res: Response, nextFunction: NextFunction) => {
        try {
            const userLocals = res.locals.user;
            if (!userLocals) throw new AppError("user not defined", 401);
            const { user, estates } = await this.service.showMeEstates(userLocals.id);

            return res.status(200).json({ ok: true, message: "Successfull list of estate", data: { user, estates } })


        } catch (error) { nextFunction(error) }
    }
    private service: UserService;
    constructor(service: UserService) {
        this.service = service;
    }

    getMe = async (_req: Request, res: Response, nextFunction: NextFunction) => {
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
    getMeFavorites = async (_req: Request, res: Response, nextFunction: NextFunction) => {
        try {
            const userLocals = res.locals.user;
            if (!userLocals) throw new AppError("user not defined", 401);

            const data = await this.service.showFavorites(userLocals.id);
            return res.status(200).json({ ok: true, message: "successfull show info with favorites", data })

        } catch (error) { nextFunction(error) }
    }
    createFavorite = async (req: Request, res: Response, nextFunction: NextFunction) => {
        logger.info("create favorite");
        try {
            const userLocals = res.locals.user;
            if (!userLocals) throw new AppError("user not defined", 401);
            const idEstate = ObjectIdSchema.safeParse(req.body);
            if (!idEstate.success) throw new AppError(`Bad request: ${getZodError(idEstate.error)}`, 400);

            const data = await this.service.addToMyFavorite(userLocals.id, idEstate.data._id);
            if (!data) throw new AppError("not found user to add  favorites", 404);
            return res.status(200).json({ ok: true, message: "successful add favorite", data });



        } catch (error) {
            nextFunction(error)
        }
    }

    deleteFavorite = async (req: Request, res: Response, nextFunction: NextFunction) => {
        logger.info("delete favorite");
        try {

            const userLocals = res.locals.user;
            if (!userLocals) throw new AppError("user not defined", 401);
            const idEstate = ObjectIdSchema.safeParse(req.params);
            if (!idEstate.success) throw new AppError(`Bad request , query param:${getZodError(idEstate.error)}`, 400);
            const data = await this.service.removeToMyFavorite(userLocals.id, idEstate.data._id);
            if (!data) throw new AppError("not found user to remove  favorite", 404);
            return res.status(200).json({ ok: true, message: "successful delete one favorite", data });

        } catch (error) {
            nextFunction(error);
        }

    }


}