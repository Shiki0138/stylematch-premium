import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { TRPCReactProvider } from "~/trpc/react"
import { SessionProvider } from "@stylematch/auth/react"
import { Toaster } from "@stylematch/ui/toaster"
import { Header } from "~/components/layout/header"
import { Footer } from "~/components/layout/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StyleMatch Premium - AI美容診断プラットフォーム",
  description: "AI診断であなたの顔型・パーソナルカラーを分析。プロの美容師があなただけのスタイルを提案します。",
  keywords: ["美容", "AI診断", "パーソナルカラー", "ヘアスタイル", "美容師", "オンライン相談"],
  authors: [{ name: "StyleMatch" }],
  creator: "StyleMatch",
  publisher: "StyleMatch",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    title: "StyleMatch Premium - AI美容診断プラットフォーム",
    description: "AI診断であなたの顔型・パーソナルカラーを分析。プロの美容師があなただけのスタイルを提案します。",
    url: "/",
    siteName: "StyleMatch Premium",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "StyleMatch Premium",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StyleMatch Premium - AI美容診断プラットフォーム",
    description: "AI診断であなたの顔型・パーソナルカラーを分析。プロの美容師があなただけのスタイルを提案します。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <TRPCReactProvider>
              <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </TRPCReactProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}