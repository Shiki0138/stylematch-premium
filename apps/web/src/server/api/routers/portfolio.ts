import { z } from "zod"
import { createTRPCRouter, publicProcedure, stylistProcedure } from "../trpc"
import { prisma } from "@stylematch/database"
import { TRPCError } from "@trpc/server"
import { uploadImage, deleteImage } from "../../services/image-upload"

export const portfolioRouter = createTRPCRouter({
  // Get stylist's portfolio
  getStylistPortfolio: publicProcedure
    .input(z.object({
      stylistId: z.string(),
      category: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const items = await prisma.portfolioItem.findMany({
        where: {
          stylistId: input.stylistId,
          isPublished: true,
          category: input.category,
        },
        include: {
          tags: true,
        },
        orderBy: [
          { isFeatured: "desc" },
          { createdAt: "desc" },
        ],
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (items.length > input.limit) {
        const nextItem = items.pop()
        nextCursor = nextItem?.id
      }

      return {
        items,
        nextCursor,
      }
    }),

  // Get portfolio categories
  getCategories: publicProcedure
    .input(z.object({
      stylistId: z.string(),
    }))
    .query(async ({ input }) => {
      const categories = await prisma.portfolioItem.groupBy({
        by: ["category"],
        where: {
          stylistId: input.stylistId,
          isPublished: true,
        },
        _count: {
          category: true,
        },
      })

      return categories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      }))
    }),

  // Create portfolio item
  createItem: stylistProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      category: z.string().min(1).max(50),
      beforeImageBase64: z.string(),
      afterImageBase64: z.string(),
      techniques: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      isFeatured: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      // Upload images
      const [beforeImageUrl, afterImageUrl] = await Promise.all([
        uploadImage({
          base64: input.beforeImageBase64,
          userId: ctx.user.id,
          type: "portfolio",
        }),
        uploadImage({
          base64: input.afterImageBase64,
          userId: ctx.user.id,
          type: "portfolio",
        }),
      ])

      // Create portfolio item
      const item = await prisma.portfolioItem.create({
        data: {
          stylistId,
          title: input.title,
          description: input.description,
          category: input.category,
          beforeImageUrl,
          afterImageUrl,
          techniques: input.techniques,
          isFeatured: input.isFeatured,
          isPublished: true,
          tags: {
            connectOrCreate: input.tags?.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })) || [],
          },
        },
        include: {
          tags: true,
        },
      })

      return item
    }),

  // Update portfolio item
  updateItem: stylistProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      category: z.string().min(1).max(50).optional(),
      techniques: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      isFeatured: z.boolean().optional(),
      isPublished: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      // Check ownership
      const existing = await prisma.portfolioItem.findFirst({
        where: {
          id: input.id,
          stylistId,
        },
      })

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ポートフォリオアイテムが見つかりません",
        })
      }

      // Update item
      const { id, tags, ...updateData } = input
      const item = await prisma.portfolioItem.update({
        where: { id },
        data: {
          ...updateData,
          tags: tags ? {
            set: [],
            connectOrCreate: tags.map(tag => ({
              where: { name: tag },
              create: { name: tag },
            })),
          } : undefined,
        },
        include: {
          tags: true,
        },
      })

      return item
    }),

  // Delete portfolio item
  deleteItem: stylistProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      // Check ownership
      const item = await prisma.portfolioItem.findFirst({
        where: {
          id: input.id,
          stylistId,
        },
      })

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "ポートフォリオアイテムが見つかりません",
        })
      }

      // Delete images
      await Promise.all([
        deleteImage(item.beforeImageUrl),
        deleteImage(item.afterImageUrl),
      ])

      // Delete item
      await prisma.portfolioItem.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get portfolio statistics
  getStatistics: stylistProcedure
    .query(async ({ ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      const [totalItems, publishedItems, featuredItems, categories] = await Promise.all([
        prisma.portfolioItem.count({
          where: { stylistId },
        }),
        prisma.portfolioItem.count({
          where: { stylistId, isPublished: true },
        }),
        prisma.portfolioItem.count({
          where: { stylistId, isFeatured: true },
        }),
        prisma.portfolioItem.groupBy({
          by: ["category"],
          where: { stylistId },
          _count: { category: true },
        }),
      ])

      return {
        totalItems,
        publishedItems,
        featuredItems,
        categoriesCount: categories.length,
        itemsByCategory: categories.map(cat => ({
          category: cat.category,
          count: cat._count.category,
        })),
      }
    }),

  // Search portfolio items
  searchItems: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      stylistId: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      const items = await prisma.portfolioItem.findMany({
        where: {
          isPublished: true,
          stylistId: input.stylistId,
          category: input.category,
          OR: [
            { title: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
            { techniques: { has: input.query } },
          ],
          tags: input.tags ? {
            some: {
              name: { in: input.tags },
            },
          } : undefined,
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
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      })

      return items
    }),
})