
import bcrypt from 'bcrypt';
import User from '../models/User.model';

export const getHashedPassword = async (payload: {  password:string;}) => {
  const hashed = await bcrypt.hash(payload.password, 10);
  return hashed;
};

export const verifyPassword = async (user: User, password: string) => {
  return bcrypt.compare(password, user.password);
};
