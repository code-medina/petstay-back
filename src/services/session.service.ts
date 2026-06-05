import ms from "ms";
import { checkRefresh, toHashRefresh } from "../lib/hash.js";
import { generateRefreshToken, generateToken } from "../lib/jwt.js";
import type { ISessionRepository } from "../repositories/session.repository.js"
import type { ISession } from "../models/session.model.js"
import mongoose from "mongoose";
import { env } from "process";
import { AppError } from "../errors/app.error.js";
import { logger } from "../lib/logger.js";

export class SessionService {
    private repo: ISessionRepository;
    constructor(repository: ISessionRepository) {
        this.repo = repository;
    }
    removeSession = async (userId: string, jti: string, refreshToken: string) => {
        try {
            const sessionRemoved = await this.repo.removeSession(userId, jti);
            if (!sessionRemoved) throw new AppError("Refresh token not found", 404);
            const isValid = await checkRefresh(refreshToken, sessionRemoved.refreshHash);
            if (!isValid) throw new AppError('Unauthorized', 400);

            return sessionRemoved;

        } catch (error) {

            if (error instanceof AppError) throw error;
        }
    }
    generateSession = async (userId: string) => {
        const access = generateToken(userId);
        const { refresh, jti } = generateRefreshToken(userId);

        //session with hash  in db
        const hash = await toHashRefresh(refresh);
        try {
            const objectId = new mongoose.Types.ObjectId(userId);

            const session: Omit<ISession, "_id"> = {
                userId: objectId,
                jti,
                expiresAt: new Date(
                    Date.now() + ms(env.JWT_REFRESH_EXPIRES as ms.StringValue),
                ),
                refreshHash: hash,
            };
            return { access, refresh, session };
        } catch (err) {
            logger.error(err)
            throw new AppError("Error generating session with ID", 500)


        }
    }
    //userId 
    saveSession = async (userId: string) => {
        try {
            const { access, refresh, session } = await this.generateSession(userId);
            const sessionSaved = await this.repo.saveSession(session);
            return { access, refresh, sessionSaved };

        } catch (error) {
            logger.error(error);
            if (error instanceof AppError) throw error;
            throw new AppError("Error saving session of user", 500);

        }

    }

}