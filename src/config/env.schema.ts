import { z } from "zod";
const envSchema = z.object({

    PORT_API: z.coerce.number(),
    NODE_ENV: z.enum(["development", "production", "test"]),
    CORS_ORIGINS: z.string().transform((value: string) => value.trim().length > 0 ? value.split(",") : []),
    KEY_COOKIE: z.string(),

    URL_DB: z.string(),

    SECRET_ACCESS_TOKEN: z.string(),
    SECRET_REFRESH_TOKEN: z.string(),
    JWT_ACCESS_EXPIRES: z.string(),
    JWT_REFRESH_EXPIRES: z.string(),

    LOG_LEVEL:z.string(),
})
export const env = envSchema.parse(process.env);