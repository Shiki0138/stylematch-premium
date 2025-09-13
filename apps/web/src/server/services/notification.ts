import { z } from "zod"
import { sendEmail } from "./email"
import { prisma } from "@stylematch/database"

const notificationSchema = z.object({
  userId: z.string(),
  type: z.enum([
    "NEW_BOOKING",
    "BOOKING_CONFIRMED",
    "BOOKING_REMINDER",
    "BOOKING_CANCELLED",
    "CONSULTATION_STARTED",
    "CONSULTATION_COMPLETED",
    "NEW_REVIEW",
    "NEW_MESSAGE",
    "PAYMENT_RECEIVED",
    "PROFILE_APPROVED",
    "PROFILE_REJECTED",
  ]),
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).optional(),
})

type NotificationOptions = z.infer<typeof notificationSchema>

export async function sendNotification(options: NotificationOptions) {
  try {
    const validated = notificationSchema.parse(options)
    
    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: validated.userId },
      select: {
        email: true,
        name: true,
        customerProfile: {
          select: {
            preferredLanguage: true,
          },
        },
      },
    })
    
    if (!user) {
      throw new Error("User not found")
    }
    
    // Send email notification
    // In a real app, you would check user notification preferences
    await sendEmail({
      to: user.email,
      subject: validated.title,
      template: getEmailTemplate(validated.type),
      data: {
        name: user.name || "お客様",
        ...validated.data,
      },
    })
    
    // TODO: Send push notification if enabled
    // TODO: Send LINE notification if connected
    
    // Store notification in database
    await prisma.auditLog.create({
      data: {
        userId: validated.userId,
        action: "NOTIFICATION_SENT",
        entity: "Notification",
        entityId: validated.userId,
        metadata: {
          type: validated.type,
          title: validated.title,
        },
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error("Notification error:", error)
    throw error
  }
}

function getEmailTemplate(notificationType: string): any {
  const templateMap: Record<string, string> = {
    NEW_BOOKING: "booking-confirmation",
    BOOKING_CONFIRMED: "booking-confirmation",
    BOOKING_REMINDER: "booking-reminder",
    BOOKING_CANCELLED: "booking-cancelled",
    CONSULTATION_COMPLETED: "consultation-completed",
    NEW_REVIEW: "review-request",
  }
  
  return templateMap[notificationType] || "welcome"
}