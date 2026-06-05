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
    closeSession = async (userId: string, jti: string) => {
        try {
            const sessionRemoved = await this.repo.removeSession(userId, jti);
            return sessionRemoved;
        } catch (err) {
            logger.info({ msg: "error close session", err });
            return null;
        }
    }
    checkRefreshWithSession = async (refresh: string, sessionRemoved: ISession) => {

        return await checkRefresh(refresh, sessionRemoved.refreshHash);

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