import {AuthService, AuthServiceImpl, LoginDetails, RegistrationDetails} from './auth.service';
import {NextApiHandler} from 'next';
import { Session } from 'src/common/models';
import {constants} from 'http2';

export interface AuthController {
  postLogIn: NextApiHandler<Session>;
  postLogOut: NextApiHandler;
  postRegister: NextApiHandler<Session>;
}

export class AuthControllerImpl implements AuthController {
  constructor(private readonly authService: AuthService = new AuthServiceImpl()) {
    // noop
  }

  readonly postLogIn: NextApiHandler<Session> = async (req, res) => {
    try {
      const loginDetails = req.body as LoginDetails;
      const session = await this.authService.logIn(loginDetails);
      res.status(constants.HTTP_STATUS_OK).json(session);
    } catch {
      res.status(constants.HTTP_STATUS_UNAUTHORIZED).end();
    }
  };

  readonly postLogOut: NextApiHandler = async (req, res) => {
    const [tokenType = null, sessionId = null] = req.headers['authorization']?.split(' ') ?? [];
    if (tokenType !== 'Bearer' as const) {
      res.status(constants.HTTP_STATUS_BAD_REQUEST).end();
      return;
    }
  }

  readonly postRegister: NextApiHandler<Session> = async (req, res) => {
    try {
      const registrationDetails = req.body as RegistrationDetails;
      const session = await this.authService.register(registrationDetails);
      res.status(constants.HTTP_STATUS_OK).json(session);
    } catch {
      res.status(constants.HTTP_STATUS_BAD_REQUEST).end();
    }
  }
}
