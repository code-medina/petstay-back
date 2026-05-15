import * as z from 'zod';

export const CreateEstateDto = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'The name must be at least 3 characters long.')
      .max(30, 'Name must be a maximum of 30 characters'),

    address: z.object({
      street: z
        .string()
        .trim()
        .min(3, 'The street must be at least 3 characters long.')
        .max(30, 'The street must be a maximum of 30 characters'),

      zone: z
        .string()
        .trim()
        .min(3, 'The zone must be at least 3 characters long.')
        .max(30, 'The zone must be a maximum of 30 characters'),

      city: z
        .string()
        .trim()
        .min(3, 'The city must be at least 3 characters long.')
        .max(30, 'The city must be a maximum of 30 characters'),

      state: z
        .string()
        .trim()
        .min(3, 'The state must be at least 3 characters long.')
        .max(30, 'The state must be a maximum of 30 characters'),

      postalCode: z.string().optional(),

      country: z
        .string()
        .trim()
        .min(3, 'The country must be at least 3 characters long.')
        .max(30, 'The country must be a maximum of 30 characters'),
    }),

    price: z.number().positive('The price must be positive'),

    animalAllowed: z.array(z.string()).optional(),

    maximumAnimalAllowed: z
      .number()
      .int()
      .positive('The maximum animal allowed number must be positive'),

    maximumPerson: z
      .number()
      .int()
      .positive('The maximum person number must be positive'),

    rooms: z.number().int().positive('The rooms number must be positive'),

    bathrooms: z
      .number()
      .int()
      .positive('The bathrooms number must be positive'),

    hasPatio: z.boolean(),

    patioDimensions: z
      .object({
        length: z
          .number()
          .positive('The patio length must be positive'),

        width: z
          .number()
          .positive('The patio width must be positive'),
      })
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, 'The description must be a maximum of 500 characters')
      .optional(),

    rentalType: z.enum(['monthly', 'daily', 'annual', 'holiday']),
  })
  .superRefine((data, ctx) => {
    if (data.hasPatio && !data.patioDimensions) {
      ctx.addIssue({
        code: "custom",
        path: ['patioDimensions'],
        message: 'Patio dimensions are required when hasPatio is true',
      });
    }

    if (!data.hasPatio && data.patioDimensions) {
      ctx.addIssue({
        code: "custom",
        path: ['patioDimensions'],
        message: 'Patio dimensions should not exist when hasPatio is false',
      });
    }
  });
export type CreateEstateDtoType=z.infer<typeof CreateEstateDto>;
