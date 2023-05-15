import {PrismaClient} from '@prisma/client';
import { User } from 'src/common/models';

type UserRequired = Pick<User, 'username' | 'passwordHashed' | 'userType'>;

export interface UserService {
  getUserByIdOrThrow(id: User['id']): Promise<User>;
  getUserByUsernameOrThrow(username: User['username']): Promise<User>;
  createUser(data: UserRequired): Promise<User>;
}

export class UserServiceImpl implements UserService {
  constructor(private readonly prismaClient = new PrismaClient()) {
    // noop
  }

  async getUserByIdOrThrow(id: User['id']): Promise<User> {
    return this.prismaClient.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async getUserByUsernameOrThrow(username: User['username']): Promise<User> {
    return this.prismaClient.user.findUniqueOrThrow({
      where: {
        username,
      },
    });
  }

  async createUser(data: UserRequired): Promise<User> {
    return this.prismaClient.user.create({
      data,
    });
  }
}
