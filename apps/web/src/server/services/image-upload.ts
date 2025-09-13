import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { z } from "zod"
import sharp from "sharp"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const uploadSchema = z.object({
  base64: z.string(),
  userId: z.string(),
  type: z.enum(["avatar", "analysis", "portfolio", "style-history"]),
})

type UploadOptions = z.infer<typeof uploadSchema>

const IMAGE_QUALITY = 85
const MAX_DIMENSIONS = {
  avatar: { width: 512, height: 512 },
  analysis: { width: 1024, height: 1024 },
  portfolio: { width: 1920, height: 1920 },
  "style-history": { width: 1280, height: 1280 },
}

export async function uploadImage(options: UploadOptions): Promise<string> {
  try {
    const validated = uploadSchema.parse(options)
    
    // Convert base64 to buffer
    const base64Data = validated.base64.replace(/^data:image\/\w+;base64,/, "")
    const buffer = Buffer.from(base64Data, "base64")
    
    // Process image with sharp
    const dimensions = MAX_DIMENSIONS[validated.type]
    const processedBuffer = await sharp(buffer)
      .resize(dimensions.width, dimensions.height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: IMAGE_QUALITY })
      .toBuffer()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const filename = `${validated.type}/${validated.userId}/${timestamp}-${randomString}.jpg`
    
    // Upload to S3 (in production) or save locally (in development)
    if (process.env.NODE_ENV === "production" && process.env.AWS_S3_BUCKET) {
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: processedBuffer,
        ContentType: "image/jpeg",
        CacheControl: "max-age=31536000", // 1 year
        Metadata: {
          userId: validated.userId,
          uploadType: validated.type,
        },
      })
      
      await s3Client.send(command)
      
      // Return CloudFront URL if configured, otherwise S3 URL
      const baseUrl = process.env.CDN_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`
      return `${baseUrl}/${filename}`
    } else {
      // In development, save to local directory
      const fs = await import("fs/promises")
      const path = await import("path")
      
      const uploadsDir = path.join(process.cwd(), "public", "uploads", validated.type, validated.userId)
      await fs.mkdir(uploadsDir, { recursive: true })
      
      const localPath = path.join(uploadsDir, `${timestamp}-${randomString}.jpg`)
      await fs.writeFile(localPath, processedBuffer)
      
      return `/uploads/${validated.type}/${validated.userId}/${timestamp}-${randomString}.jpg`
    }
  } catch (error) {
    console.error("Image upload error:", error)
    throw new Error("画像のアップロードに失敗しました")
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === "production" && process.env.AWS_S3_BUCKET) {
      // Extract key from URL
      const url = new URL(imageUrl)
      const key = url.pathname.substring(1) // Remove leading slash
      
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3")
      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      })
      
      await s3Client.send(command)
    } else {
      // In development, delete local file
      const fs = await import("fs/promises")
      const path = await import("path")
      
      const localPath = path.join(process.cwd(), "public", imageUrl)
      await fs.unlink(localPath).catch(() => {
        // Ignore errors if file doesn't exist
      })
    }
  } catch (error) {
    console.error("Image deletion error:", error)
    // Don't throw error for deletion failures
  }
}

export async function generateThumbnail(
  imageUrl: string,
  width: number = 200,
  height: number = 200
): Promise<string> {
  try {
    // Fetch original image
    const response = await fetch(imageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    
    // Generate thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toBuffer()
    
    // Convert to base64 data URL
    return `data:image/jpeg;base64,${thumbnailBuffer.toString("base64")}`
  } catch (error) {
    console.error("Thumbnail generation error:", error)
    // Return original image if thumbnail generation fails
    return imageUrl
  }
}