export type {
  Product,
  CampaignProduct,
  Campaign,
  User,
  Review,
} from '@prisma/client'

export const enum UserType {
  OWNER = 'owner',
  REVIEWER = 'reviewer',
  CONSUMER = 'consumer',
}
