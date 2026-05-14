import { Schema, model, Types } from 'mongoose';

export interface ISession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
    jti: string;
  expiresAt: Date;
  refreshHash: string;
}
const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    expiresAt: { type: Date, expires: 0 },
    refreshHash: {
      type: String,
      required: [true, 'refresh is required'],
      unique: [true, 'refresh already exists'],
    },
      jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const Session = model<ISession>('Session', SessionSchema);
