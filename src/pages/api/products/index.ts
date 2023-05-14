import { ProductController, ProductControllerImpl } from 'src/backend/modules/product';
import { NextApiHandler } from 'next';
import { constants } from 'http2';

const productController: ProductController = new ProductControllerImpl();

const handler: NextApiHandler = async (req, res) => {
  switch (req.method?.toUpperCase()) {
  case 'GET':
    return productController.getQueryMultipleProducts(req, res);
  case 'POST':
    return productController.postCreateProduct(req, res);
  default:
    break;
  }

  res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).end();
}

export default handler;
