import { z } from "zod"
import { createTRPCRouter, adminProcedure } from "../trpc"
import { prisma } from "@stylematch/database"
import { TRPCError } from "@trpc/server"
import { UserRole, StylistStatus } from "@prisma/client"
import { sendNotification } from "../../services/notification"

export const adminRouter = createTRPCRouter({
  // Dashboard statistics
  getDashboardStats: adminProcedure
    .query(async () => {
      const [userStats, consultationStats, revenueStats, stylistStats] = await Promise.all([
        // User statistics
        prisma.user.groupBy({
          by: ["role"],
          _count: { role: true },
        }),
        // Consultation statistics
        prisma.consultation.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        // Revenue statistics
        prisma.payment.aggregate({
          where: { status: "SUCCEEDED" },
          _sum: { amount: true },
          _count: true,
        }),
        // Stylist approval statistics
        prisma.stylistProfile.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
      ])

      // Calculate monthly revenue
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)
      
      const monthlyRevenue = await prisma.payment.aggregate({
        where: {
          status: "SUCCEEDED",
          paidAt: { gte: currentMonth },
        },
        _sum: { amount: true },
      })

      return {
        users: {
          total: userStats.reduce((sum, stat) => sum + stat._count.role, 0),
          byRole: Object.fromEntries(
            userStats.map(stat => [stat.role, stat._count.role])
          ),
        },
        consultations: {
          total: consultationStats.reduce((sum, stat) => sum + stat._count.status, 0),
          byStatus: Object.fromEntries(
            consultationStats.map(stat => [stat.status, stat._count.status])
          ),
        },
        revenue: {
          total: revenueStats._sum.amount || 0,
          transactionCount: revenueStats._count,
          monthlyTotal: monthlyRevenue._sum.amount || 0,
        },
        stylists: {
          total: stylistStats.reduce((sum, stat) => sum + stat._count.status, 0),
          byStatus: Object.fromEntries(
            stylistStats.map(stat => [stat.status, stat._count.status])
          ),
        },
      }
    }),

  // User management
  getUsers: adminProcedure
    .input(z.object({
      role: z.nativeEnum(UserRole).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const users = await prisma.user.findMany({
        where: {
          role: input.role,
          OR: input.search ? [
            { email: { contains: input.search, mode: "insensitive" } },
            { name: { contains: input.search, mode: "insensitive" } },
          ] : undefined,
        },
        include: {
          customerProfile: true,
          stylistProfile: true,
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (users.length > input.limit) {
        const nextItem = users.pop()
        nextCursor = nextItem?.id
      }

      return {
        users,
        nextCursor,
      }
    }),

  // Update user status
  updateUserStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      isActive: z.boolean(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.update({
        where: { id: input.userId },
        data: {
          // In a real app, you might have an isActive field
          // For now, we'll use metadata
          metadata: {
            isActive: input.isActive,
            statusChangedAt: new Date(),
            statusChangeReason: input.reason,
          },
        },
      })

      // Send notification
      await sendNotification({
        userId: user.id,
        type: "NEW_MESSAGE",
        title: input.isActive 
          ? "アカウントが有効化されました"
          : "アカウントが停止されました",
        body: input.reason || "詳細はサポートにお問い合わせください",
        data: {
          isActive: input.isActive,
        },
      })

      return user
    }),

  // Stylist approval
  getPendingStylists: adminProcedure
    .query(async () => {
      const stylists = await prisma.stylistProfile.findMany({
        where: { status: "PENDING_APPROVAL" },
        include: {
          user: true,
          portfolioItems: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          certifications: true,
        },
        orderBy: { createdAt: "asc" },
      })

      return stylists
    }),

  // Approve or reject stylist
  reviewStylist: adminProcedure
    .input(z.object({
      stylistId: z.string(),
      action: z.enum(["approve", "reject"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const newStatus = input.action === "approve" ? "APPROVED" : "REJECTED"
      
      const stylist = await prisma.stylistProfile.update({
        where: { id: input.stylistId },
        data: {
          status: newStatus,
          approvedAt: input.action === "approve" ? new Date() : undefined,
          approvalNotes: input.notes,
        },
        include: {
          user: true,
        },
      })

      // Send notification
      await sendNotification({
        userId: stylist.user.id,
        type: input.action === "approve" ? "PROFILE_APPROVED" : "PROFILE_REJECTED",
        title: input.action === "approve" 
          ? "プロフィールが承認されました"
          : "プロフィールが却下されました",
        body: input.action === "approve"
          ? "おめでとうございます！今すぐコンサルテーションを始められます。"
          : input.notes || "プロフィールを改善して再申請してください。",
        data: {
          status: newStatus,
          notes: input.notes,
        },
      })

      return stylist
    }),

  // Content moderation
  getReportedContent: adminProcedure
    .input(z.object({
      type: z.enum(["review", "portfolio", "message"]).optional(),
      resolved: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      // In a real app, you would have a reports table
      // For now, we'll return mock data
      return {
        reports: [],
      }
    }),

  // System settings
  getSystemSettings: adminProcedure
    .query(async () => {
      // In a real app, you would have a settings table
      return {
        platformFeePercentage: 20,
        minimumPayoutAmount: 1000,
        consultationCancellationHours: 24,
        maxConsultationDuration: 120,
        supportedLanguages: ["ja", "en"],
        maintenanceMode: false,
      }
    }),

  // Update system settings
  updateSystemSettings: adminProcedure
    .input(z.object({
      platformFeePercentage: z.number().min(0).max(50).optional(),
      minimumPayoutAmount: z.number().min(0).optional(),
      consultationCancellationHours: z.number().min(0).optional(),
      maxConsultationDuration: z.number().min(30).optional(),
      maintenanceMode: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      // In a real app, update settings in database
      return {
        ...input,
        updated: true,
      }
    }),

  // Analytics
  getAnalytics: adminProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
      metric: z.enum(["revenue", "users", "consultations", "stylists"]),
    }))
    .query(async ({ input }) => {
      const { startDate, endDate, metric } = input

      switch (metric) {
        case "revenue": {
          const dailyRevenue = await prisma.payment.groupBy({
            by: ["paidAt"],
            where: {
              status: "SUCCEEDED",
              paidAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: { amount: true },
            _count: true,
          })

          return {
            data: dailyRevenue.map(day => ({
              date: day.paidAt,
              value: day._sum.amount || 0,
              count: day._count,
            })),
          }
        }

        case "users": {
          const dailyUsers = await prisma.user.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _count: true,
          })

          return {
            data: dailyUsers.map(day => ({
              date: day.createdAt,
              value: day._count,
            })),
          }
        }

        case "consultations": {
          const dailyConsultations = await prisma.consultation.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _count: true,
          })

          return {
            data: dailyConsultations.map(day => ({
              date: day.createdAt,
              value: day._count,
            })),
          }
        }

        case "stylists": {
          const dailyStylists = await prisma.stylistProfile.groupBy({
            by: ["createdAt"],
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
            _count: true,
          })

          return {
            data: dailyStylists.map(day => ({
              date: day.createdAt,
              value: day._count,
            })),
          }
        }
      }
    }),

  // Audit logs
  getAuditLogs: adminProcedure
    .input(z.object({
      userId: z.string().optional(),
      action: z.string().optional(),
      entity: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const logs = await prisma.auditLog.findMany({
        where: {
          userId: input.userId,
          action: input.action,
          entity: input.entity,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (logs.length > input.limit) {
        const nextItem = logs.pop()
        nextCursor = nextItem?.id
      }

      return {
        logs,
        nextCursor,
      }
    }),
})