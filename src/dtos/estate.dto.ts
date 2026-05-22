import * as z from 'zod';
import mongoose from 'mongoose';

/* ------------------------------------------------ */
/* Helpers */
/* ------------------------------------------------ */

const textField = (field: string) =>
  z
    .string()
    .trim()
    .min(3, `The ${field} must be at least 3 characters long.`)
    .max(30, `The ${field} must be a maximum of 30 characters`);

export const MongoIdSchema = z.string().refine(
  mongoose.isValidObjectId,
  {
    message: 'Invalid MongoDB ID',
  }
);
export type MongoIdSchemaType=z.infer<typeof MongoIdSchema>;

/* ------------------------------------------------ */
/* Nested Schemas */
/* ------------------------------------------------ */

const PatioDimensionsSchema = z.object({
  length: z.coerce
    .number()
    .positive('The patio length must be positive'),

  width: z.coerce
    .number()
    .positive('The patio width must be positive'),
});

const AddressSchema = z.object({
  street: textField('street'),

  zone: textField('zone'),

  city: textField('city'),

  state: textField('state'),

  postalCode: z.string().trim().min(1).optional(),

  country: textField('country'),
});

/* ------------------------------------------------ */
/* Base Schema */
/* ------------------------------------------------ */

const EstateBaseSchema = z.object({
  owner:MongoIdSchema,
  name: textField('name'),

  address: AddressSchema,

  price: z.coerce
    .number()
    .positive('The price must be positive'),

  animalAllowed: z
    .array(
      z.string().trim().min(1)
    )
    .optional(),

  maximumAnimalAllowed: z.coerce
    .number()
    .int()
    .positive('The maximum animal allowed number must be positive'),

  maximumPerson: z.coerce
    .number()
    .int()
    .positive('The maximum person number must be positive'),

  rooms: z.coerce
    .number()
    .int()
    .positive('The rooms number must be positive'),

  bathrooms: z.coerce
    .number()
    .int()
    .positive('The bathrooms number must be positive'),

  hasPatio: z.boolean(),

  patioDimensions: PatioDimensionsSchema.optional(),

  description: z
    .string()
    .trim()
    .max(500, 'The description must be a maximum of 500 characters')
    .optional(),

  rentalType: z.enum([
    'monthly',
    'daily',
    'annual',
    'holiday',
  ]),
});

/* ------------------------------------------------ */
/* Create DTO */
/* ------------------------------------------------ */

export const CreateEstateDto = EstateBaseSchema.superRefine(
  (data, ctx) => {
    if (data.hasPatio && !data.patioDimensions) {
      ctx.addIssue({
        code: "custom",
        path: ['patioDimensions'],
        message:
          'Patio dimensions are required when hasPatio is true',
      });
    }

    if (!data.hasPatio && data.patioDimensions) {
      ctx.addIssue({
        code: "custom",
        path: ['patioDimensions'],
        message:
          'Patio dimensions should not exist when hasPatio is false',
      });
    }
  }
);

export type CreateEstateDtoType =
  z.infer<typeof CreateEstateDto>;

/* ------------------------------------------------ */
/* Edit DTO */
/* ------------------------------------------------ */

export const EditEstateDto = EstateBaseSchema
  .partial()
  .extend({
    _id: MongoIdSchema,
    owner:MongoIdSchema,
  })
  .superRefine((data, ctx) => {
    /*
      Solo validamos si hasPatio existe
      para soportar updates parciales
    */

    if (
      data.hasPatio === true &&
      !data.patioDimensions
    ) {
      ctx.addIssue({
        code: "custom",
        path: ['patioDimensions'],
        message:
          'Patio dimensions are required when hasPatio is true',
      });
    }

    if (
      data.hasPatio === false &&
      data.patioDimensions
    ) {
      ctx.addIssue({
        code:"custom",
        path: ['patioDimensions'],
        message:
          'Patio dimensions should not exist when hasPatio is false',
      });
    }
  });

export type EditEstateDtoType =
  z.infer<typeof EditEstateDto>;

export const  DeleteEstateDto=z.object({
  _id:MongoIdSchema,
  owner:MongoIdSchema
});
export type DeleteEstateDtoType=z.infer<typeof DeleteEstateDto>;