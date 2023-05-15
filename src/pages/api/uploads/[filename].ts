import { constants } from "http2";
import { NextApiHandler } from "next";
import { UploadController, UploadControllerImpl } from "src/backend/modules/upload";

const uploadController: UploadController = new UploadControllerImpl();

const handler: NextApiHandler = async (req, res) => {
  if (req.method?.toUpperCase() === 'PUT') {
    return uploadController.uploadFile(req, res);
  }

  res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).end();
}

export default handler;

export const config = {
  api: {
    bodyParser: false,
  }
};
