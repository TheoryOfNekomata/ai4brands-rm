import { ProductController, ProductControllerImpl } from 'src/backend/modules/product';
import { NextApiHandler } from 'next';
import { constants } from 'http2';

const productController: ProductController = new ProductControllerImpl();

const handler: NextApiHandler = async (req, res) => {
  switch (req.method?.toUpperCase()) {
  case 'GET':
    return productController.getProductById(req, res);
  case 'PUT':
    return productController.putEmplaceProduct(req, res);
  case 'PATCH':
    return productController.patchUpdateExistingProduct(req, res);
  case 'DELETE':
    return productController.deleteProductById(req, res);
  default:
    break;
  }

  res.status(constants.HTTP_STATUS_METHOD_NOT_ALLOWED).end();
}

export default handler;
