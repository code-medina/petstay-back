import bcrypt from 'bcrypt';

export const toHashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};
export const checkPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
