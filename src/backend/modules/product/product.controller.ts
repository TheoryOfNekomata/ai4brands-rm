import { constants } from 'http2';
import { Prisma } from '@prisma/client';
import { NextApiHandler } from 'next';
import { Product } from 'src/common/models';
import { ProductService, ProductServiceImpl } from './product.service';

export interface ProductController {
  getQueryMultipleProducts: NextApiHandler<Product[]>;
  getProductById: NextApiHandler<Product>;
  postCreateProduct: NextApiHandler<Product>;
  patchUpdateExistingProduct: NextApiHandler<Product>;
  putEmplaceProduct: NextApiHandler<Product>;
  deleteProduct: NextApiHandler<Product>;
}

export class ProductControllerImpl implements ProductController {
  constructor(private readonly productService: ProductService = new ProductServiceImpl()) {
    // noop
  }

  readonly getQueryMultipleProducts: NextApiHandler<Product[]> = async (req, res) => {
    const products = await this.productService.queryMultipleProducts();
    res.status(constants.HTTP_STATUS_OK).json(products);
  };

  readonly getProductById: NextApiHandler<Product> = async (req, res) => {
    try {
      const productId = req.query.productId as Product['id'];
      const product = await this.productService.getProductByIdOrThrow(productId);
      res.status(constants.HTTP_STATUS_OK).json(product);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError
        && err.code === 'P2025'
      ) {
        res.status(constants.HTTP_STATUS_NOT_FOUND).end();
        return;
      }

      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
    }
  };

  readonly postCreateProduct: NextApiHandler<Product> = async (req, res) => {
    try {
      const productData = req.body as Product;
      const newProduct = await this.productService.createProduct(productData);
      res.status(constants.HTTP_STATUS_CREATED).json(newProduct);
    } catch (err) {
      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
    }
  }

  readonly patchUpdateExistingProduct: NextApiHandler<Product> = async (req, res) => {
    try {
      const productId = req.query.productId as Product['id'];
      const productData = req.body as Product;
      const existingProduct = await this.productService.getProductByIdOrThrow(productId);
      const updatedProduct = await this.productService.upsertProduct(existingProduct.id, productData);
      res.status(constants.HTTP_STATUS_OK).json(updatedProduct);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError
        && err.code === 'P2025'
      ) {
        res.status(constants.HTTP_STATUS_NOT_FOUND).end();
        return;
      }

      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
    }
  }

  readonly putEmplaceProduct: NextApiHandler<Product> = async (req, res) => {
    const productId = req.query.productId as Product['id'];
    const productData = req.body as Product;
    let isCreated = false;
    try {
      // test existence of product
      await this.productService.getProductByIdOrThrow(productId);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError
        && err.code !== 'P2025'
      ) {
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
        return;
      }

      isCreated = true;
    }

    try {
      const updatedProduct = await this.productService.upsertProduct(productId, productData);
      res.status(isCreated ? constants.HTTP_STATUS_CREATED : constants.HTTP_STATUS_OK).json(updatedProduct);
    } catch {
      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
      return;
    }
  }

  readonly deleteProduct: NextApiHandler<Product> = async (req, res) => {
    const productId = req.query.productId as Product['id'];

    try {
      // test existence of product
      await this.productService.getProductByIdOrThrow(productId);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError
        && err.code === 'P2025'
      ) {
        res.status(constants.HTTP_STATUS_NOT_FOUND).end();
        return;
      }

      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
      return;
    }

    try {
      await this.productService.deleteProductById(productId);
      res.status(constants.HTTP_STATUS_NO_CONTENT).end();
    } catch {
      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
      return;
    }
  }
}
