import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { Providers } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StyleMatch - AI美容診断で理想の美容師と出会う",
  description: "AI技術で顔型診断・パーソナルカラー診断を行い、あなたに最適な美容師をマッチング",
  keywords: ["美容診断", "AI診断", "顔型診断", "パーソナルカラー", "美容師マッチング"],
  authors: [{ name: "StyleMatch Team" }],
  openGraph: {
    title: "StyleMatch - AI美容診断で理想の美容師と出会う",
    description: "AI技術で顔型診断・パーソナルカラー診断を行い、あなたに最適な美容師をマッチング",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://stylematch.app",
    siteName: "StyleMatch",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StyleMatch - AI美容診断で理想の美容師と出会う",
    description: "AI技術で顔型診断・パーソナルカラー診断を行い、あなたに最適な美容師をマッチング",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <body className="bg-background text-text-primary antialiased">
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
