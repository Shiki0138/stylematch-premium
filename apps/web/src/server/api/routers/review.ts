import { z } from "zod"
import { createTRPCRouter, publicProcedure, customerProcedure } from "../trpc"
import { prisma } from "@stylematch/database"
import { TRPCError } from "@trpc/server"
import { sendNotification } from "../../services/notification"

export const reviewRouter = createTRPCRouter({
  // Get reviews for a stylist
  getStylistReviews: publicProcedure
    .input(z.object({
      stylistId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const reviews = await prisma.review.findMany({
        where: {
          stylistId: input.stylistId,
          isPublished: true,
        },
        include: {
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          consultation: {
            select: {
              type: true,
              scheduledAt: true,
            },
          },
        },
        orderBy: [
          { helpfulCount: "desc" },
          { createdAt: "desc" },
        ],
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (reviews.length > input.limit) {
        const nextItem = reviews.pop()
        nextCursor = nextItem?.id
      }

      // Calculate average ratings
      const allReviews = await prisma.review.findMany({
        where: {
          stylistId: input.stylistId,
          isPublished: true,
        },
        select: {
          overallRating: true,
          communicationRating: true,
          skillRating: true,
          valueRating: true,
        },
      })

      const totalReviews = allReviews.length
      const averageRatings = totalReviews > 0 ? {
        overall: allReviews.reduce((sum, r) => sum + r.overallRating, 0) / totalReviews,
        communication: allReviews.reduce((sum, r) => sum + r.communicationRating, 0) / totalReviews,
        skill: allReviews.reduce((sum, r) => sum + r.skillRating, 0) / totalReviews,
        value: allReviews.reduce((sum, r) => sum + r.valueRating, 0) / totalReviews,
      } : null

      return {
        reviews: reviews.map(review => ({
          ...review,
          customer: {
            ...review.customer,
            user: {
              name: review.customer.user.name || "匿名",
              image: review.customer.user.image,
            },
          },
        })),
        nextCursor,
        totalReviews,
        averageRatings,
      }
    }),

  // Create a review
  createReview: customerProcedure
    .input(z.object({
      consultationId: z.string(),
      overallRating: z.number().min(1).max(5),
      communicationRating: z.number().min(1).max(5),
      skillRating: z.number().min(1).max(5),
      valueRating: z.number().min(1).max(5),
      comment: z.string().min(10).max(1000),
      isAnonymous: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const customerId = ctx.user.customerProfile?.id
      if (!customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "顧客プロフィールが必要です",
        })
      }

      // Check if consultation exists and belongs to the user
      const consultation = await prisma.consultation.findFirst({
        where: {
          id: input.consultationId,
          customerId,
          status: "COMPLETED",
        },
        include: {
          stylist: {
            include: {
              user: true,
            },
          },
        },
      })

      if (!consultation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "完了した相談が見つかりません",
        })
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          consultationId: input.consultationId,
        },
      })

      if (existingReview) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "既にレビューが投稿されています",
        })
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          consultationId: input.consultationId,
          customerId,
          stylistId: consultation.stylistId,
          overallRating: input.overallRating,
          communicationRating: input.communicationRating,
          skillRating: input.skillRating,
          valueRating: input.valueRating,
          comment: input.comment,
          isAnonymous: input.isAnonymous,
          isPublished: true, // Could add moderation workflow here
        },
      })

      // Update stylist's average rating
      const stylistReviews = await prisma.review.findMany({
        where: {
          stylistId: consultation.stylistId,
          isPublished: true,
        },
        select: {
          overallRating: true,
        },
      })

      const averageRating = stylistReviews.reduce((sum, r) => sum + r.overallRating, 0) / stylistReviews.length

      await prisma.stylistProfile.update({
        where: { id: consultation.stylistId },
        data: {
          averageRating,
          totalReviews: stylistReviews.length,
        },
      })

      // Send notification to stylist
      await sendNotification({
        userId: consultation.stylist.user.id,
        type: "NEW_REVIEW",
        title: "新しいレビューが投稿されました",
        body: `${input.overallRating}つ星のレビューを受け取りました`,
        data: {
          reviewId: review.id,
          rating: input.overallRating,
        },
      })

      return review
    }),

  // Mark a review as helpful
  markHelpful: publicProcedure
    .input(z.object({
      reviewId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const review = await prisma.review.update({
        where: { id: input.reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      })

      return review
    }),

  // Get review summary for a stylist
  getReviewSummary: publicProcedure
    .input(z.object({
      stylistId: z.string(),
    }))
    .query(async ({ input }) => {
      const reviews = await prisma.review.findMany({
        where: {
          stylistId: input.stylistId,
          isPublished: true,
        },
        select: {
          overallRating: true,
          communicationRating: true,
          skillRating: true,
          valueRating: true,
          consultation: {
            select: {
              type: true,
            },
          },
        },
      })

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRatings: null,
          ratingDistribution: null,
          consultationTypeBreakdown: null,
        }
      }

      // Calculate average ratings
      const averageRatings = {
        overall: reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length,
        communication: reviews.reduce((sum, r) => sum + r.communicationRating, 0) / reviews.length,
        skill: reviews.reduce((sum, r) => sum + r.skillRating, 0) / reviews.length,
        value: reviews.reduce((sum, r) => sum + r.valueRating, 0) / reviews.length,
      }

      // Calculate rating distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviews.filter(r => r.overallRating === rating).length,
        percentage: (reviews.filter(r => r.overallRating === rating).length / reviews.length) * 100,
      }))

      // Calculate consultation type breakdown
      const consultationTypes = reviews.reduce((acc, review) => {
        const type = review.consultation.type
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const consultationTypeBreakdown = Object.entries(consultationTypes).map(([type, count]) => ({
        type,
        count,
        percentage: (count / reviews.length) * 100,
      }))

      return {
        totalReviews: reviews.length,
        averageRatings,
        ratingDistribution,
        consultationTypeBreakdown,
      }
    }),

  // Get pending reviews for customer
  getPendingReviews: customerProcedure
    .query(async ({ ctx }) => {
      const customerId = ctx.user.customerProfile?.id
      if (!customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "顧客プロフィールが必要です",
        })
      }

      const consultations = await prisma.consultation.findMany({
        where: {
          customerId,
          status: "COMPLETED",
          review: null,
          completedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 過去30日間
          },
        },
        include: {
          stylist: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: "desc" },
      })

      return consultations
    }),
})