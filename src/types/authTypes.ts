import { Role } from '../constants/roles';

export interface jwtPayload {
  userId: string;
  role: Role;
}
