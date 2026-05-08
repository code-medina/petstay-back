import { Schema, model, Types } from 'mongoose';

export interface ISession {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
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
      unique: [true, 'email already exists'],
    },
  },
  { timestamps: true },
);

export const Session = model<ISession>('Session', SessionSchema);
