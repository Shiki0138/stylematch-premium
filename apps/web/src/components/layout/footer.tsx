import Link from "next/link"
import { Sparkles, Twitter, Instagram, Facebook, Mail } from "lucide-react"

const navigation = {
  services: [
    { name: "AI診断", href: "/diagnosis" },
    { name: "美容師検索", href: "/stylists" },
    { name: "オンライン相談", href: "/consultation" },
    { name: "料金プラン", href: "/pricing" },
  ],
  support: [
    { name: "ヘルプセンター", href: "/help" },
    { name: "よくある質問", href: "/faq" },
    { name: "お問い合わせ", href: "/contact" },
    { name: "使い方ガイド", href: "/guide" },
  ],
  company: [
    { name: "運営会社", href: "/about" },
    { name: "ニュース", href: "/news" },
    { name: "キャリア", href: "/careers" },
    { name: "パートナー", href: "/partners" },
  ],
  legal: [
    { name: "利用規約", href: "/terms" },
    { name: "プライバシーポリシー", href: "/privacy" },
    { name: "特定商取引法", href: "/commercial-law" },
    { name: "cookie設定", href: "/cookies" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/stylematch",
      icon: Twitter,
    },
    {
      name: "Instagram", 
      href: "https://instagram.com/stylematch",
      icon: Instagram,
    },
    {
      name: "Facebook",
      href: "https://facebook.com/stylematch",
      icon: Facebook,
    },
    {
      name: "Email",
      href: "mailto:contact@stylematch.jp",
      icon: Mail,
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
            {/* Logo & Description */}
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">StyleMatch</span>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                AI技術を活用した美容診断で、あなたに最適なスタイルを見つけるプラットフォーム。
                プロの美容師との出会いで、理想の自分に近づきましょう。
              </p>
              <div className="flex space-x-4">
                {navigation.social.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      <span className="sr-only">{item.name}</span>
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
                サービス
              </h3>
              <ul className="space-y-3">
                {navigation.services.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
                サポート
              </h3>
              <ul className="space-y-3">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
                会社情報
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
                法的情報
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              © 2024 StyleMatch Premium. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>Made with ❤️ in Japan</span>
              <div className="flex items-center space-x-1">
                <span>Powered by</span>
                <Link 
                  href="https://nextjs.org" 
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Next.js
                </Link>
                <span>×</span>
                <Link 
                  href="https://vercel.com" 
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vercel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}