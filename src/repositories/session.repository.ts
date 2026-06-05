import { Session, type ISession } from "../models/session.model.js";

export interface ISessionRepository {
    saveSession(session: Omit<ISession, "_id">): Promise<ISession>;
    removeSession(userId: string, jti: string): Promise<ISession | null>;
}
export class SessionRepository implements ISessionRepository {
    saveSession(session: Omit<ISession, "_id">): Promise<ISession> {
        return Session.create(session);
    }
    removeSession(userId: string, jti: string): Promise<ISession | null> {
        return Session.findOneAndDelete({ userId, jti })
    }

}