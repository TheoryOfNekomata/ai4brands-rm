import { PrismaClient } from '@prisma/client';
import { Product } from 'src/common/models';

type ProductRequired = Pick<Product, 'name'>;

export interface ProductService {
  queryMultipleProducts(): Promise<Product[]>;
  getProductByIdOrThrow(id: Product['id']): Promise<Product>;
  createProduct(data: ProductRequired): Promise<Product>;
  upsertProduct(id: Product['id'], data: ProductRequired & Partial<Product>): Promise<Product>;
  deleteProductById(id: Product['id']): Promise<void>;
}

export class ProductServiceImpl implements ProductService {
  constructor(private readonly prismaClient = new PrismaClient()) {
    // noop
  }

  async queryMultipleProducts(): Promise<Product[]> {
    return this.prismaClient.product.findMany();
  }

  async getProductByIdOrThrow(id: Product['id']): Promise<Product> {
    return this.prismaClient.product.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async createProduct(data: ProductRequired): Promise<Product> {
    return this.prismaClient.product.create({
      data,
    })
  }

  async upsertProduct(id: Product['id'], data: ProductRequired & Partial<Product>): Promise<Product> {
    return this.prismaClient.product.upsert({
      where: {
        id,
      },
      update: data,
      create: data,
    });
  }

  async deleteProductById(id: Product['id']): Promise<void> {
    await this.prismaClient.product.delete({
      where: {
        id,
      },
    })
  }
}
