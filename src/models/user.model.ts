import { Schema, model, Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'landlord';
  favorites: Types.ObjectId[];
  estates: Types.ObjectId[];
}
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      maxLength: [30, 'name must be less than 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      maxLength: [40, 'email must be less than 40 characters'],
      unique: [true, 'email already exists'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      maxLength: [100, 'password 50 must be less than 50 characters'],
      minLength: [6, 'password must be at least 6 characters long'],
    },
    role: {
      type: String,
      enum: ['tenant', 'landlord'],
      default: 'tenant',
    },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Estate' }],
    estates: [{ type: Schema.Types.ObjectId, ref: 'Estate' }],
  },
  { timestamps: true },
);

export const User = model<IUser>('User', UserSchema);
