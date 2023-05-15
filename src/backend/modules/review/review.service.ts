import {PrismaClient} from '@prisma/client';
import { Review } from 'src/common/models';

export type ReviewRequired = Pick<Review, 'content' | 'productId' | 'reviewerUserId'>

export type ReviewEditable = Pick<Review, 'content'>

export interface ReviewService {
  getReviewsByReviewerUserId(reviewerUserId: Review['reviewerUserId']): Promise<Review[]>;
  getReviewsByProductId(productId: Review['productId']): Promise<Review[]>;
  getReviewByIdOrThrow(id: Review['id']): Promise<Review>;
  createReview(data: ReviewRequired): Promise<Review>;
  updateReviewById(id: Review['id'], data: ReviewEditable): Promise<Review>;
  deleteReviewById(id: Review['id']): Promise<void>;
}

export class ReviewServiceImpl implements ReviewService {
  constructor(private readonly prismaClient = new PrismaClient()) {
    // noop
  }

  async getReviewsByReviewerUserId(reviewerUserId: Review['reviewerUserId']): Promise<Review[]> {
    return this.prismaClient.review.findMany({
      where: {
        reviewerUserId,
      },
    });
  }

  async getReviewsByProductId(productId: Review['productId']): Promise<Review[]> {
    return this.prismaClient.review.findMany({
      where: {
        productId,
      },
    });
  }

  async getReviewByIdOrThrow(id: Review['id']): Promise<Review> {
    return this.prismaClient.review.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async createReview(data: ReviewRequired): Promise<Review> {
    return this.prismaClient.review.create({
      data,
    });
  }

  async updateReviewById(id: Review['id'], data: ReviewEditable): Promise<Review> {
    return this.prismaClient.review.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteReviewById(id: Review['id']): Promise<void> {
    await this.prismaClient.review.delete({
      where: {
        id,
      },
    });
  }
}
