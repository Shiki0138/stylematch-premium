import { z } from "zod"
import { createTRPCRouter, publicProcedure, customerProcedure, stylistProcedure } from "../trpc"
import { prisma } from "@stylematch/database"
import { TRPCError } from "@trpc/server"
import { sendNotification } from "../../services/notification"
import { ConsultationType, BookingStatus } from "@prisma/client"

export const bookingRouter = createTRPCRouter({
  // Get available slots for a stylist
  getAvailableSlots: publicProcedure
    .input(z.object({
      stylistId: z.string(),
      date: z.string(), // YYYY-MM-DD format
      consultationType: z.nativeEnum(ConsultationType),
    }))
    .query(async ({ input }) => {
      const { stylistId, date, consultationType } = input
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

      // Get stylist availability for the day
      const availability = await prisma.stylistAvailability.findMany({
        where: {
          stylistId,
          dayOfWeek: targetDate.getDay(),
          isAvailable: true,
        },
      })

      if (availability.length === 0) {
        return { slots: [] }
      }

      // Get existing bookings for the day
      const existingBookings = await prisma.consultation.findMany({
        where: {
          stylistId,
          scheduledAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
        select: {
          scheduledAt: true,
          duration: true,
        },
      })

      // Generate available time slots
      const slots: Date[] = []
      const slotDuration = consultationType === "FULL_CONSULTATION" ? 60 : 30
      
      for (const avail of availability) {
        const [startHour, startMinute] = avail.startTime.split(":").map(Number)
        const [endHour, endMinute] = avail.endTime.split(":").map(Number)
        
        let currentTime = new Date(targetDate)
        currentTime.setHours(startHour, startMinute, 0, 0)
        
        const endTime = new Date(targetDate)
        endTime.setHours(endHour, endMinute, 0, 0)
        
        while (currentTime < endTime) {
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000)
          
          // Check if slot conflicts with existing bookings
          const hasConflict = existingBookings.some(booking => {
            const bookingEnd = new Date(booking.scheduledAt.getTime() + booking.duration * 60 * 1000)
            return (
              (currentTime >= booking.scheduledAt && currentTime < bookingEnd) ||
              (slotEnd > booking.scheduledAt && slotEnd <= bookingEnd) ||
              (currentTime <= booking.scheduledAt && slotEnd >= bookingEnd)
            )
          })
          
          if (!hasConflict && currentTime > new Date()) {
            slots.push(new Date(currentTime))
          }
          
          currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000) // 30分刻み
        }
      }

      return { slots: slots.sort((a, b) => a.getTime() - b.getTime()) }
    }),

  // Create a booking
  createBooking: customerProcedure
    .input(z.object({
      stylistId: z.string(),
      scheduledAt: z.date(),
      consultationType: z.nativeEnum(ConsultationType),
      isOnline: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const customerId = ctx.user.customerProfile?.id
      if (!customerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "顧客プロフィールが必要です",
        })
      }

      // Get stylist details and pricing
      const stylist = await prisma.stylistProfile.findUnique({
        where: { id: input.stylistId },
        include: {
          pricing: {
            where: { consultationType: input.consultationType },
          },
          user: true,
        },
      })

      if (!stylist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "スタイリストが見つかりません",
        })
      }

      const pricing = stylist.pricing[0]
      if (!pricing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "料金設定が見つかりません",
        })
      }

      // Check availability
      const duration = input.consultationType === "FULL_CONSULTATION" ? 60 : 30
      const endTime = new Date(input.scheduledAt.getTime() + duration * 60 * 1000)
      
      const conflictingBooking = await prisma.consultation.findFirst({
        where: {
          stylistId: input.stylistId,
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
          OR: [
            {
              scheduledAt: {
                gte: input.scheduledAt,
                lt: endTime,
              },
            },
            {
              AND: [
                { scheduledAt: { lte: input.scheduledAt } },
                {
                  scheduledAt: {
                    gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                  },
                },
              ],
            },
          ],
        },
      })

      if (conflictingBooking) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "選択された時間帯は既に予約されています",
        })
      }

      // Create consultation
      const consultation = await prisma.consultation.create({
        data: {
          customerId,
          stylistId: input.stylistId,
          scheduledAt: input.scheduledAt,
          duration,
          type: input.consultationType,
          isOnline: input.isOnline,
          price: pricing.price,
          message: input.message,
          status: "SCHEDULED",
        },
        include: {
          stylist: {
            include: {
              user: true,
            },
          },
          customer: {
            include: {
              user: true,
            },
          },
        },
      })

      // Send notifications
      await Promise.all([
        sendNotification({
          userId: stylist.user.id,
          type: "NEW_BOOKING",
          title: "新しい予約が入りました",
          body: `${consultation.customer.user.name}様から${input.consultationType === "FULL_CONSULTATION" ? "フルコンサルテーション" : "ミニコンサルテーション"}の予約が入りました`,
          data: {
            consultationId: consultation.id,
            customerName: consultation.customer.user.name,
            scheduledAt: consultation.scheduledAt,
          },
        }),
        sendNotification({
          userId: consultation.customer.user.id,
          type: "BOOKING_CONFIRMED",
          title: "予約が確定しました",
          body: `${consultation.stylist.user.name}様との相談が予約されました`,
          data: {
            consultationId: consultation.id,
            stylistName: consultation.stylist.user.name,
            scheduledAt: consultation.scheduledAt,
          },
        }),
      ])

      return consultation
    }),

  // Cancel a booking
  cancelBooking: customerProcedure
    .input(z.object({
      consultationId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const consultation = await prisma.consultation.findFirst({
        where: {
          id: input.consultationId,
          customer: {
            userId: ctx.user.id,
          },
        },
        include: {
          stylist: {
            include: {
              user: true,
            },
          },
          customer: {
            include: {
              user: true,
            },
          },
        },
      })

      if (!consultation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "予約が見つかりません",
        })
      }

      if (consultation.status !== "SCHEDULED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "この予約はキャンセルできません",
        })
      }

      // Check cancellation policy (24 hours notice)
      const hoursUntilAppointment = Math.floor(
        (consultation.scheduledAt.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      )

      const isCancellationFeeFree = hoursUntilAppointment >= 24

      // Update consultation status
      const updated = await prisma.consultation.update({
        where: { id: input.consultationId },
        data: {
          status: "CANCELLED",
          notes: input.reason,
          cancelledAt: new Date(),
        },
      })

      // Send notifications
      await sendNotification({
        userId: consultation.stylist.user.id,
        type: "BOOKING_CANCELLED",
        title: "予約がキャンセルされました",
        body: `${consultation.customer.user.name}様が予約をキャンセルしました`,
        data: {
          consultationId: consultation.id,
          customerName: consultation.customer.user.name,
          scheduledAt: consultation.scheduledAt,
          reason: input.reason,
        },
      })

      return {
        ...updated,
        isCancellationFeeFree,
      }
    }),

  // Reschedule a booking
  rescheduleBooking: customerProcedure
    .input(z.object({
      consultationId: z.string(),
      newScheduledAt: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      const consultation = await prisma.consultation.findFirst({
        where: {
          id: input.consultationId,
          customer: {
            userId: ctx.user.id,
          },
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
          message: "予約が見つかりません",
        })
      }

      if (consultation.status !== "SCHEDULED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "この予約は変更できません",
        })
      }

      // Check new slot availability
      const duration = consultation.duration
      const endTime = new Date(input.newScheduledAt.getTime() + duration * 60 * 1000)
      
      const conflictingBooking = await prisma.consultation.findFirst({
        where: {
          stylistId: consultation.stylistId,
          id: { not: consultation.id },
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
          OR: [
            {
              scheduledAt: {
                gte: input.newScheduledAt,
                lt: endTime,
              },
            },
            {
              AND: [
                { scheduledAt: { lte: input.newScheduledAt } },
                {
                  scheduledAt: {
                    gte: new Date(input.newScheduledAt.getTime() - duration * 60 * 1000),
                  },
                },
              ],
            },
          ],
        },
      })

      if (conflictingBooking) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "選択された時間帯は既に予約されています",
        })
      }

      // Update consultation
      const updated = await prisma.consultation.update({
        where: { id: input.consultationId },
        data: {
          scheduledAt: input.newScheduledAt,
        },
      })

      // Send notification to stylist
      await sendNotification({
        userId: consultation.stylist.user.id,
        type: "BOOKING_CONFIRMED",
        title: "予約時間が変更されました",
        body: `${consultation.customer.displayName}様が予約時間を変更しました`,
        data: {
          consultationId: consultation.id,
          oldScheduledAt: consultation.scheduledAt,
          newScheduledAt: input.newScheduledAt,
        },
      })

      return updated
    }),

  // Update stylist availability
  updateAvailability: stylistProcedure
    .input(z.object({
      availability: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        isAvailable: z.boolean(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const stylistId = ctx.user.stylistProfile?.id
      if (!stylistId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "スタイリストプロフィールが必要です",
        })
      }

      // Delete existing availability
      await prisma.stylistAvailability.deleteMany({
        where: { stylistId },
      })

      // Create new availability
      const created = await prisma.stylistAvailability.createMany({
        data: input.availability.map(avail => ({
          stylistId,
          ...avail,
        })),
      })

      return { count: created.count }
    }),

  // Get stylist's upcoming bookings
  getStylistBookings: stylistProcedure
    .input(z.object({
      status: z.array(z.nativeEnum(BookingStatus)).optional(),
      limit: z.number().min(1).max(100).default(20),
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

      const bookings = await prisma.consultation.findMany({
        where: {
          stylistId,
          status: input.status ? { in: input.status } : undefined,
        },
        include: {
          customer: {
            include: {
              user: true,
              analysisResults: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      })

      let nextCursor: typeof input.cursor | undefined = undefined
      if (bookings.length > input.limit) {
        const nextItem = bookings.pop()
        nextCursor = nextItem?.id
      }

      return {
        bookings,
        nextCursor,
      }
    }),
})