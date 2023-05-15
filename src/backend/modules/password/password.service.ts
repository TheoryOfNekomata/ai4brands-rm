import { hash, compare, genSalt, } from 'bcrypt';

export interface PasswordService {
  hash(passwordPlaintext: string): Promise<string>;
  compare(passwordPlaintext: string, passwordHashed: string): Promise<boolean>;
}

export class PasswordServiceImpl implements PasswordService {
  async hash(passwordPlaintext: string): Promise<string> {
    const salt = await genSalt(Number(process.env.BCRYPT_SALT_ROUNDS ?? 10));
    return hash(passwordPlaintext, salt);
  }

  async compare(passwordPlaintext: string, passwordHashed: string): Promise<boolean> {
    return compare(passwordPlaintext, passwordHashed);
  }
}
