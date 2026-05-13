import { ZodError } from 'zod';
export const getZodError = (error: ZodError) => {
  return error.issues.map((m) => m.message).join('⚠️​');
};
