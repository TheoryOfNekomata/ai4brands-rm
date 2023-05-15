import { NextApiHandler } from "next";
import { UploadService, UploadServiceImpl } from "./upload.service";
import { constants } from "http2";

export interface UploadController {
  uploadFile: NextApiHandler<void>;
}

export class UploadControllerImpl implements UploadController {
  constructor(private readonly uploadService: UploadService = new UploadServiceImpl()) {
  }

  readonly uploadFile: NextApiHandler<void> = async (req, res) => {
    const filename = req.query.filename as string;

    const file = await new Promise<Buffer>((resolve, reject) => {
      let theBuffer = Buffer.from('');
      req.on('data', (chunk) => {
        theBuffer = Buffer.concat([theBuffer, chunk]);
      });
      req.on('end', () => {
        resolve(theBuffer);
      });
    });

    const path = await this.uploadService.uploadFile(file, filename);
    const url = new URL(path, req.headers['origin']).toString();
    res.status(constants.HTTP_STATUS_CREATED).setHeader('Location', url).end();
  }
}
