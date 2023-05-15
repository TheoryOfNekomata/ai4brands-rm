import {ReviewRequired, ReviewService, ReviewServiceImpl} from './review.service';
import {NextApiHandler} from 'next';
import { Review } from 'src/common/models';
import {constants} from 'http2';
import {Prisma} from '@prisma/client';
import {SessionService, SessionServiceImpl} from 'src/backend/modules/session';

export interface ReviewController {

}

export class ReviewControllerImpl implements ReviewController {
  constructor(
    private readonly reviewService: ReviewService = new ReviewServiceImpl(),
    private readonly sessionService: SessionService = new SessionServiceImpl(),
  ) {
    // noop
  }

  readonly getReviewsByProductId: NextApiHandler<Review[]> = async (req, res) => {
    const productId = req.query.productId as Review['productId'];
    const reviews = await this.reviewService.getReviewsByProductId(productId);
    res.status(constants.HTTP_STATUS_OK).json(reviews);
  };

  readonly getReviewsByReviewerUserId: NextApiHandler<Review[]> = async (req, res) => {
    const reviewerUserId = req.query.reviewerUserId as Review['reviewerUserId'];
    const reviews = await this.reviewService.getReviewsByReviewerUserId(reviewerUserId);
    res.status(constants.HTTP_STATUS_OK).json(reviews);
  };

  readonly getReviewById: NextApiHandler<Review> = async (req, res) => {
    try {
      const id = req.query.id as Review['id'];
      const review = await this.reviewService.getReviewByIdOrThrow(id);
      res.status(constants.HTTP_STATUS_OK).json(review);
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

  readonly postCreateReview: NextApiHandler<Review> = async (req, res) => {
    const [tokenType = null, sessionId = null] = req.headers['authorization']?.split(' ') ?? [];
    if (tokenType !== 'Bearer' as const) {
      res.status(constants.HTTP_STATUS_BAD_REQUEST).end();
      return;
    }

    if (sessionId === null) {
      res.status(constants.HTTP_STATUS_UNAUTHORIZED).end();
      return;
    }

    let reviewerUserId: Review['reviewerUserId'];
    try {
      const session = await this.sessionService.getSessionByIdOrThrow(sessionId);
      reviewerUserId = session.userId;
    } catch {
      res.status(constants.HTTP_STATUS_UNAUTHORIZED).end();
      return;
    }

    try {
      const review = req.body as ReviewRequired;
      const newReview = await this.reviewService.createReview({
        ...review,
        reviewerUserId,
      });
      res.status(constants.HTTP_STATUS_CREATED).json(newReview);
    } catch (err) {
      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).end();
    }
  };

  readonly patchUpdateExistingReview: NextApiHandler<Review> = async (req, res) => {
    try {
      const reviewId = req.query.reviewId
    }
  };
}
