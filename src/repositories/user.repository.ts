
import type { MongoIdSchemaType } from "../dtos/common.dto.js"
import type { IEstate } from "../models/estate.model.js"
import { User, type IUser } from "../models/user.model.js"

export interface IUserPopulatedFavorites
    extends Omit<IUser, 'favorites'> {

    favorites: IEstate[]
}

export interface IUserPopulatedEstates
    extends Omit<IUser, 'password'> {

    estates: IEstate[]
}
export interface IUserRepository {


    removeFavorite(idUser: MongoIdSchemaType, idEstate: MongoIdSchemaType): Promise<IUser | null>;
    addFavorites(idUser: MongoIdSchemaType, idEstate: MongoIdSchemaType): Promise<IUser | null>;
    findMe(id: MongoIdSchemaType): Promise<IUser | null>;
    findMeWithFavorties(id: MongoIdSchemaType): Promise<IUserPopulatedFavorites | null>;

}
export class UserRepository
    implements IUserRepository {



    async removeFavorite(idUser: MongoIdSchemaType, idEstate: MongoIdSchemaType): Promise<IUser | null> {
        return User.findByIdAndUpdate(idUser, { $pull: { favorites: idEstate } }, { new: true }).select("-password");
    }
    async addFavorites(idUser: MongoIdSchemaType, idEstate: MongoIdSchemaType): Promise<IUser |
        null> {

        return User.findByIdAndUpdate(idUser,
            {
                $addToSet:
                {
                    favorites: idEstate

                }
            },
            { new: true })
            .select("-password");

    }

    findMe(id: MongoIdSchemaType) {
        return User.findById(id).select("-password");
    }
    async findMeWithFavorties(
        id: MongoIdSchemaType
    ): Promise<IUserPopulatedFavorites | null> {

        return User.findById(id)
            .select('-password')
            .populate<{ favorites: IEstate[] }>('favorites')
            .lean<IUserPopulatedFavorites>()
    }
}