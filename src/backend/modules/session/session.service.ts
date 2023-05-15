import { PrismaClient } from '@prisma/client';
import { Session } from 'src/common/models';

type SessionRequired = Pick<Session, 'userId' | 'validUntil'>;

export class InvalidSessionError extends Error {}

export interface SessionService {
  createSession(data: SessionRequired): Promise<Session>;
  getSessionByIdOrThrow(id: Session['id']): Promise<Session>;
  assertSessionIsValid(session: Session): Promise<void>;
  invalidateSession(id: Session['id']): Promise<void>;
}

export class SessionServiceImpl implements SessionService {
  constructor(private readonly prismaClient = new PrismaClient()) {
    // noop
  }

  async createSession(data: SessionRequired): Promise<Session> {
    return this.prismaClient.session.create({
      data,
      include: {
        user: {
          select: {
            username: true,
            userType: true,
          },
        },
      },
    })
  }

  private async doGetSessionByIdOrThrow(id: Session['id']): Promise<Session> {
    return this.prismaClient.session.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            username: true,
            userType: true,
          },
        },
      },
    });
  }

  async getSessionByIdOrThrow(id: Session['id']): Promise<Session> {
    return this.doGetSessionByIdOrThrow(id);
  }

  private async doAssertSessionIsValid(session: Session): Promise<void> {
    const now = new Date();
    const sessionIsValid = session.createdAt <= now && now < session.validUntil;
    if (!sessionIsValid) {
      throw new InvalidSessionError();
    }
  }

  async assertSessionIsValid(session: Session): Promise<void> {
    await this.doAssertSessionIsValid(session);
  }

  async invalidateSession(id: Session['id']): Promise<void> {
    const session = await this.doGetSessionByIdOrThrow(id);
    await this.doAssertSessionIsValid(session);
    const validUntil = new Date();
    await this.prismaClient.session.update({
      where: {
        id: session.id,
      },
      data: {
        validUntil,
      },
    });
  }
}
