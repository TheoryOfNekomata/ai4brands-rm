import {UserService, UserServiceImpl} from 'src/backend/modules/user';
import {PasswordService, PasswordServiceImpl} from 'src/backend/modules/password';
import {User, Session, UserType} from 'src/common/models';
import {SessionService, SessionServiceImpl} from 'src/backend/modules/session';

class PasswordsDoNotMatchError extends Error {}

class UserNotFoundError extends Error {}

class InvalidRegistrationError extends Error {}

export interface RegistrationDetails extends Pick<User, 'username' | 'userType'> {
  password: string;
  confirmPassword: string;
}

export interface LoginDetails {
  username: User['username'];
  passwordPlaintext: string;
  userType: User['userType'];
}

export interface AuthService {
  logIn(loginDetails: LoginDetails): Promise<Session>;
  logOut(sessionId: Session['id']): Promise<void>;
  register(data: RegistrationDetails): Promise<Session>;
}

export class AuthServiceImpl implements AuthService {
  constructor(
    private readonly userService: UserService = new UserServiceImpl(),
    private readonly passwordService: PasswordService = new PasswordServiceImpl(),
    private readonly sessionService: SessionService = new SessionServiceImpl(),
  ) {
    // noop
  }

  private getValidUntil(): Date {
    // TODO we can set validity of sessions per user type
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 7); // one week
    return validUntil;
  }

  async logIn(loginDetails: LoginDetails): Promise<Session> {
    const { username, passwordPlaintext, userType, } = loginDetails;
    const user = await this.userService.getUserByUsernameOrThrow(username);
    if (user.userType !== userType) {
      throw new UserNotFoundError();
    }
    const passwordMatches = await this.passwordService.compare(passwordPlaintext, user.passwordHashed);
    if (!passwordMatches) {
      throw new PasswordsDoNotMatchError();
    }
    return this.sessionService.createSession({
      userId: user.id,
      validUntil: this.getValidUntil(),
    });
  }

  async logOut(sessionId: Session['id']): Promise<void> {
    await this.sessionService.invalidateSession(sessionId);
  }

  async register(data: RegistrationDetails): Promise<Session> {
    try {
      switch (data.userType as unknown) {
      case UserType.OWNER:
      case UserType.CONSUMER:
      case UserType.REVIEWER: {
        if (data.password === data.confirmPassword) {
          const newUser = await this.userService.createUser({
            username: data.username,
            userType: data.userType,
            passwordHashed: await this.passwordService.hash(data.password),
          });
          return await this.sessionService.createSession({
            userId: newUser.id,
            validUntil: this.getValidUntil(),
          });
        }
      } break;
      default:
        break;
      }
    } catch {
      // noop
    }

    throw new InvalidRegistrationError();
  }
}
