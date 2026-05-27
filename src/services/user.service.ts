import type { MongoIdSchemaType } from "../dtos/estate.dto.js";
import { AppError } from "../errors/app.error.js";
import { logger } from "../lib/logger.js";
import type { IUserRepository } from "../repositories/user.repository.js";

export class UserService {
    private repo: IUserRepository;
    constructor(repository: IUserRepository) {
        this.repo = repository;
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
}