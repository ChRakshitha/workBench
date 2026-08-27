import { userRepository } from '../repositories/user.repository.js';
import { verifyPassword } from '../utils/password.js';
import type { LoginInput } from '../validation/auth.schema.js';

export class InvalidCredentialsError extends Error {}

export const authService = {
  async login({ email, password }: LoginInput) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.isDeleted) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    return user;
  },
};
