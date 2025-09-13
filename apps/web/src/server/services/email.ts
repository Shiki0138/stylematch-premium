import sgMail from "@sendgrid/mail"
import { render } from "@react-email/render"
import { z } from "zod"

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  template: z.enum([
    "welcome",
    "email-verification",
    "password-reset",
    "booking-confirmation",
    "booking-reminder",
    "booking-cancelled",
    "consultation-completed",
    "review-request",
  ]),
  data: z.record(z.any()),
})

type EmailOptions = z.infer<typeof emailSchema>

// Email templates would be React components
const templates: Record<string, (data: any) => string> = {
  "email-verification": (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>メールアドレスの確認</h1>
      <p>${data.name}様</p>
      <p>StyleMatchへのご登録ありがとうございます。</p>
      <p>以下のリンクをクリックして、メールアドレスを確認してください：</p>
      <a href="${data.verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 6px;">メールアドレスを確認</a>
      <p>このリンクは48時間有効です。</p>
    </div>
  `,
  
  "password-reset": (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>パスワードリセット</h1>
      <p>${data.name}様</p>
      <p>パスワードリセットのリクエストを受け付けました。</p>
      <p>以下のリンクをクリックして、新しいパスワードを設定してください：</p>
      <a href="${data.resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #ec4899; color: white; text-decoration: none; border-radius: 6px;">パスワードをリセット</a>
      <p>このリンクは1時間有効です。</p>
      <p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>
    </div>
  `,
  
  "booking-confirmation": (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>予約確定のお知らせ</h1>
      <p>${data.customerName}様</p>
      <p>以下の内容で予約が確定しました：</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>美容師:</strong> ${data.stylistName}</p>
        <p><strong>日時:</strong> ${data.scheduledAt}</p>
        <p><strong>内容:</strong> ${data.consultationType}</p>
        <p><strong>所要時間:</strong> ${data.duration}分</p>
        <p><strong>料金:</strong> ¥${data.price.toLocaleString()}</p>
        ${data.isOnline ? '<p><strong>形式:</strong> オンライン</p>' : `<p><strong>場所:</strong> ${data.location}</p>`}
      </div>
      <p>予約の詳細は<a href="${data.consultationUrl}">こちら</a>からご確認いただけます。</p>
    </div>
  `,
  
  "booking-reminder": (data) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>予約リマインダー</h1>
      <p>${data.customerName}様</p>
      <p>明日の予約についてお知らせします：</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p><strong>美容師:</strong> ${data.stylistName}</p>
        <p><strong>日時:</strong> ${data.scheduledAt}</p>
        <p><strong>内容:</strong> ${data.consultationType}</p>
        ${data.isOnline ? 
          `<p><strong>参加方法:</strong> 予約時間になりましたら<a href="${data.joinUrl}">こちら</a>からご参加ください。</p>` : 
          `<p><strong>場所:</strong> ${data.location}</p>`
        }
      </div>
    </div>
  `,
}

export async function sendEmail(options: EmailOptions) {
  try {
    const validated = emailSchema.parse(options)
    
    const html = templates[validated.template]?.(validated.data) || ""
    
    if (!html) {
      throw new Error(`Template ${validated.template} not found`)
    }
    
    const msg = {
      to: validated.to,
      from: process.env.EMAIL_FROM || "noreply@stylematch.jp",
      subject: validated.subject,
      html,
    }
    
    if (process.env.NODE_ENV === "production" && process.env.SENDGRID_API_KEY) {
      await sgMail.send(msg)
    } else {
      console.log("Email would be sent:", msg)
    }
    
    return { success: true }
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}

export async function sendBulkEmails(emails: EmailOptions[]) {
  const results = await Promise.allSettled(
    emails.map(email => sendEmail(email))
  )
  
  const succeeded = results.filter(r => r.status === "fulfilled").length
  const failed = results.filter(r => r.status === "rejected").length
  
  return { succeeded, failed }
}