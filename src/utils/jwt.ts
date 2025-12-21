import * as jwt from 'jsonwebtoken';
import { jwtPayload } from '../types/authTypes';

const jwtSecret = process.env.JWT_SECRET!;
const jwtExpire = process.env.JWT_EXPIRE || '7d';

export const signToken = (payload: jwtPayload): string => {
  const options: jwt.SignOptions = {
    expiresIn: jwtExpire as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, jwtSecret, options);
};

export const verifyToken = (token: string): jwtPayload => {
  return jwt.verify(token, jwtSecret) as jwtPayload;
};
