import type { MongoIdSchemaType } from "../dtos/estate.dto.js";
import { AppError } from "../errors/app.error.js";
import { logger } from "../lib/logger.js";
import { Estate } from "../models/estate.model.js";
import { EstateRepository } from "../repositories/estate.repository.js";
import type { IUserRepository } from "../repositories/user.repository.js";
import { EstateService } from "./estate.service.js";

export class UserService {
    private repo: IUserRepository;
    constructor(repository: IUserRepository) {
        this.repo = repository;
    }
    showMeEstates = async (id: MongoIdSchemaType) => {
        try {
            const user = await this.repo.findMe(id);
            if (!user) throw new AppError("user not found", 404);
            const repoEstate = new EstateRepository();
            const service = new EstateService(repoEstate);
            const estates = await service.getEstatesByIdOwner(id);
            logger.info(estates);
            return { estates, user };
        } catch (error) {
            logger.info(error);
            if (error instanceof AppError) throw error;

            throw new AppError("Failed show estates ", 500);

        }
    };

    showFavorites = async (id: MongoIdSchemaType) => {
        try {
            const userWithFavorites = await this.repo.findMeWithFavorties(id);
            if (!userWithFavorites) throw new AppError("user not found", 404);
            return userWithFavorites;
        } catch (error) {

            logger.error(error);
            if (error instanceof AppError) throw error;

            throw new AppError("Failed show favorites ", 500);

        }
    }
    showBasicInfo = async (id: MongoIdSchemaType) => {
        try {

            const user = await this.repo.findMe(id)
            if (!user) throw new AppError("Not found user", 404);
            return user;
        } catch (error) {
            logger.error(error);
            throw new AppError(`Failed show basic info user`, 500);



        }
    }
    addToMyFavorite = async (idUser: MongoIdSchemaType, idEstate: MongoIdSchemaType) => {
        try {
            const estateExists = await Estate.exists({ _id: idEstate })

            if (!estateExists) throw new AppError("Estate not found", 404);

            return this.repo.addFavorites(idUser, idEstate);
        } catch (error) {
            logger.info(error);
            if (error instanceof AppError) throw error;
            throw new AppError("Failed add to my favorite estate", 500);

        }
    }
    removeToMyFavorite = async (idUser: MongoIdSchemaType, idEstate: MongoIdSchemaType) => {
        try {
            const estateExists = await Estate.exists({ _id: idEstate })

            if (!estateExists) throw new AppError("Estate not found", 404);
            return this.repo.removeFavorite(idUser, idEstate);

        } catch (error) {
            logger.info(error);
            if (error instanceof AppError) throw error;
            throw new AppError("Failed remove to my favorite estate", 500);

        }
    }
}