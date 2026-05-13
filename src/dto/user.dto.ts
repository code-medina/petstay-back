import * as z from 'zod';

export const RoleUserDto = z.enum(['tenant', 'landlord']);
export type RoleUserDtoType = z.infer<typeof RoleUserDto>;

export const ParamRoleDto = z.object({ role: RoleUserDto });
export type ParamRoleDtoType = z.infer<typeof ParamRoleDto>;

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
    .max(500, 'password must be less than 50 characters'),
  role: RoleUserDto,
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
    .max(200, 'password must be less than 100 characters'),
});
export type LoginUserDtoTYpe = z.infer<typeof LoginUserDto>;

//respose
export const LoginResponseUserDto = z.object({
  email: z.email().max(40, 'email must be less than 40 characters'),
  _id: z.string().trim().min(3, 'Invalid id'),
  role: RoleUserDto,
  name: z
    .string()
    .trim()
    .min(3, 'name too short!')
    .max(30, 'name must be less than 30 characters'),
});
export type LoginResponseUserDtoTYpe = z.infer<typeof LoginResponseUserDto>;
