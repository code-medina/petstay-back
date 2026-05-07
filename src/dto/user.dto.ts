import * as z from 'zod';

export const RegisterUserDto = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'name too short!')
    .max(30, 'name must be less than 30 characters'),
  email: z.email().max(40, 'email must be less than 40 characters'),
  password: z
    .string()
    .trim()
    .min(6, 'password must be at least 5 characters long')
    .max(50, 'password must be less than 50 characters'),
});

// extract the inferred type
export type RegisterUserDtoType = z.infer<typeof RegisterUserDto>;
export const CreateUserDto = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'name too short!')
    .max(30, 'name must be less than 30 characters'),
  email: z.email().max(40, 'email must be less than 40 characters'),
  password: z
    .string()
    .trim()
    .min(6, 'password must be at least 5 characters long')
    .max(100, 'password must be less than 50 characters'),
  role: z.enum(['tenant', 'landlord']),
});

// extract the inferred type
export type CreateUserDtoType = z.infer<typeof CreateUserDto>;

//login
export const LoginUserDto = z.object({
  email: z.email().max(40, 'email must be less than 40 characters'),
  password: z
    .string()
    .trim()
    .min(6, 'password must be at least 5 characters long')
    .max(100, 'password must be less than 50 characters'),
});
export type LoginUserDtoTYpe = z.infer<typeof LoginUserDto>;
