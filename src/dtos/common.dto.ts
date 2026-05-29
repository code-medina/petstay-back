
import * as z from 'zod';
import mongoose from 'mongoose';

export const MongoIdSchema = z.string().refine(mongoose.isValidObjectId, {
    message: 'Invalid MongoDB ID',
});
            
export type MongoIdSchemaType = z.infer<typeof MongoIdSchema>;


// to use with res.body and res.query
export const ObjectIdSchema = z.object({
    _id: MongoIdSchema
})

export const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
});