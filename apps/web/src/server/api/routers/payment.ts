import { z } from "zod"
import { createTRPCRouter, customerProcedure, stylistProcedure, adminProcedure } from "../trpc"
import { prisma } from "@stylematch/database"
import { TRPCError } from "@trpc/server"
import { PaymentStatus, PayoutStatus } from "@prisma/client"
import { sendNotification } from "../../services/notification"

// Stripe or payment provider integration would go here
// For now, we'll use mock implementations

export const paymentRouter = createTRPCRouter({
  // Create payment intent for consultation
  createPaymentIntent: customerProcedure
    .input(z.object({
      consultationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const consultation = await prisma.consultation.findFirst({
        where: {
          id: input.consultationId,
          customerId: ctx.user.customerProfile?.id,
          status: "SCHEDULED",
        },
      })

      if (!consultation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "相談が見つかりません",
        })
      }

      // Check if payment already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { consultationId: input.consultationId },
      })

      if (existingPayment && existingPayment.status === "SUCCEEDED") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "既に支払いが完了しています",
        })
      }

      // In production, create payment intent with Stripe
      // const paymentIntent = await stripe.paymentIntents.create({...})
      
      const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2)}`

      // Create or update payment record
      const payment = await prisma.payment.upsert({
        where: { consultationId: input.consultationId },
        create: {
          consultationId: input.consultationId,
          amount: consultation.price,
          currency: "JPY",
          status: "PENDING",
          paymentIntentId,
          metadata: {
            clientSecret,
            customerId: ctx.user.customerProfile?.id,
            stylistId: consultation.stylistId,
          },
        },
        update: {
          status: "PENDING",
          paymentIntentId,
          metadata: {
            clientSecret,
            customerId: ctx.user.customerProfile?.id,
            stylistId: consultation.stylistId,
          },
        },
      })

      return {
        paymentIntentId,
        clientSecret,
        amount: consultation.price,
      }
    }),

  // Confirm payment
  confirmPayment: customerProcedure
    .input(z.object({
      paymentIntentId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const payment = await prisma.payment.findFirst({
        where: {
          paymentIntentId: input.paymentIntentId,
          consultation: {
            customerId: ctx.user.customerProfile?.id,
          },
        },
        include: {
          consultation: {
            include: {
              stylist: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      })

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "支払い情報が見つかりません",
        })
      }

      // In production, confirm payment with Stripe
      // const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId)
      
      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCEEDED",
          paidAt: new Date(),
        },
      })

      // Send notification to stylist
      await sendNotification({
        userId: payment.consultation.stylist.user.id,
        type: "PAYMENT_RECEIVED",
        title: "支払いを受け取りました",
        body: `¥${payment.amount.toLocaleString()}の支払いを受け取りました`,
        data: {
          paymentId: payment.id,
          amount: payment.amount,
        },
      })

      return updatedPayment
    }),

  // Get payment history for customer
  getCustomerPayments: customerProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const payments = await prisma.payment.findMany({
        where: {
          consultation: {
            customerId: ctx.user.customerProfile?.id,
          },
        },
        include: {
          consultation: {
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
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (payments.length > input.limit) {
        const nextItem = payments.pop()
        nextCursor = nextItem?.id
      }

      return {
        payments,
        nextCursor,
      }
    }),

  // Get earnings for stylist
  getStylistEarnings: stylistProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      const payments = await prisma.payment.findMany({
        where: {
          consultation: {
            stylistId,
          },
          status: "SUCCEEDED",
          paidAt: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        include: {
          consultation: {
            select: {
              type: true,
            },
          },
        },
      })

      const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const platformFee = totalEarnings * 0.2 // 20% platform fee
      const netEarnings = totalEarnings - platformFee

      // Earnings by consultation type
      const earningsByType = payments.reduce((acc, payment) => {
        const type = payment.consultation.type
        if (!acc[type]) {
          acc[type] = { count: 0, amount: 0 }
        }
        acc[type].count++
        acc[type].amount += payment.amount
        return acc
      }, {} as Record<string, { count: number; amount: number }>)

      return {
        totalEarnings,
        platformFee,
        netEarnings,
        transactionCount: payments.length,
        earningsByType,
      }
    }),

  // Request payout
  requestPayout: stylistProcedure
    .input(z.object({
      amount: z.number().min(1000), // Minimum payout: ¥1000
      bankAccountId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      // Check available balance
      const payments = await prisma.payment.findMany({
        where: {
          consultation: {
            stylistId,
          },
          status: "SUCCEEDED",
        },
      })

      const totalEarnings = payments.reduce((sum, payment) => sum + payment.amount, 0)
      const platformFee = totalEarnings * 0.2
      const availableBalance = totalEarnings - platformFee

      // Get previous payouts
      const previousPayouts = await prisma.payout.findMany({
        where: {
          stylistId,
          status: { in: ["PENDING", "PROCESSING", "COMPLETED"] },
        },
      })

      const totalPayouts = previousPayouts.reduce((sum, payout) => sum + payout.amount, 0)
      const remainingBalance = availableBalance - totalPayouts

      if (input.amount > remainingBalance) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "利用可能な残高を超えています",
        })
      }

      // Create payout request
      const payout = await prisma.payout.create({
        data: {
          stylistId,
          amount: input.amount,
          currency: "JPY",
          status: "PENDING",
          bankAccountId: input.bankAccountId,
          requestedAt: new Date(),
        },
      })

      // Notify admin
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
      })

      await Promise.all(
        admins.map(admin =>
          sendNotification({
            userId: admin.id,
            type: "NEW_MESSAGE",
            title: "新しい振込リクエスト",
            body: `¥${input.amount.toLocaleString()}の振込リクエストがあります`,
            data: {
              payoutId: payout.id,
              stylistId,
            },
          })
        )
      )

      return payout
    }),

  // Get payout history
  getPayoutHistory: stylistProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      const payouts = await prisma.payout.findMany({
        where: { stylistId },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (payouts.length > input.limit) {
        const nextItem = payouts.pop()
        nextCursor = nextItem?.id
      }

      return {
        payouts,
        nextCursor,
      }
    }),

  // Admin: Process payout
  processPayout: adminProcedure
    .input(z.object({
      payoutId: z.string(),
      action: z.enum(["approve", "reject"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const payout = await prisma.payout.findUnique({
        where: { id: input.payoutId },
        include: {
          stylist: {
            include: {
              user: true,
            },
          },
        },
      })

      if (!payout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "振込リクエストが見つかりません",
        })
      }

      if (payout.status !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "このリクエストは既に処理されています",
        })
      }

      const newStatus = input.action === "approve" ? "PROCESSING" : "REJECTED"
      
      const updated = await prisma.payout.update({
        where: { id: input.payoutId },
        data: {
          status: newStatus,
          processedAt: new Date(),
          notes: input.notes,
        },
      })

      // Notify stylist
      await sendNotification({
        userId: payout.stylist.user.id,
        type: "NEW_MESSAGE",
        title: input.action === "approve" 
          ? "振込リクエストが承認されました"
          : "振込リクエストが却下されました",
        body: input.action === "approve"
          ? `¥${payout.amount.toLocaleString()}の振込が処理されています`
          : `振込リクエストが却下されました${input.notes ? `：${input.notes}` : ""}`,
        data: {
          payoutId: payout.id,
        },
      })

      return updated
    }),
})