import { z } from 'zod';
import { roles } from '../constants/roles';

/**
 * REGISTER VALIDATION
 * Validates EVERYTHING that can be validated at request level
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters long'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Email must be a valid email address')
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),

  role: z
    .string()
    .min(1, 'Role is required')
    .refine(
      (val) => val === roles.pm || val === roles.member,
      "Role must be either 'pm' or 'member'"
    ),
});

/**
 * LOGIN VALIDATION
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Email must be a valid email address')
    .transform((email) => email.toLowerCase()),

  password: z.string().min(1, 'Password is required'),
});
