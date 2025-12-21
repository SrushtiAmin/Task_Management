import { Request } from 'express';
import { jwtPayload } from './authTypes';

export interface authRequest extends Request {
  user?: jwtPayload;
}
