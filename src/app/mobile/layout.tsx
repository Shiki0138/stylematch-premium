import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'StyleMatch - AI美容診断マッチングアプリ',
  description: 'AI顔型診断で、あなたにぴったりの美容師を見つけます',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}