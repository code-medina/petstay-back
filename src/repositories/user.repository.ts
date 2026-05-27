import type { MongoIdSchemaType } from "../dtos/estate.dto.js"
import type { IEstate } from "../models/estate.model.js"
import { User, type IUser } from "../models/user.model.js"

export interface IUserPopulated
    extends Omit<IUser, 'favorites'> {

    favorites: IEstate[]
}
export interface IUserRepository {

    findMe(id: MongoIdSchemaType): Promise<IUser | null>;
    findMeWithFavorties(id: MongoIdSchemaType): Promise<IUserPopulated | null>;

}
export class UserRepository
    implements IUserRepository {

    findMe(id: MongoIdSchemaType) {
        return User.findById(id).select("-password");
    }
    async findMeWithFavorties(
        id: MongoIdSchemaType
    ): Promise<IUserPopulated | null> {

        return User.findById(id)
            .select('-password')
            .populate<{ favorites: IEstate[] }>('favorites')
            .lean<IUserPopulated>()
    }
}