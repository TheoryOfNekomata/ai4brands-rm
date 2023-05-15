import {NextApiHandler} from 'next';
import {constants} from 'http2';
import {AuthController, AuthControllerImpl} from 'src/backend/modules/auth';

const authController: AuthController = new AuthControllerImpl();

const handler: NextApiHandler = async (req, res) => {
  if (req.method?.toUpperCase() !== 'POST') {
    res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).end();
    return;
  }

  return authController.postLogOut(req, res);
};

export default handler;
