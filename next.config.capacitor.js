/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  // exportPathMapはNext.js 13+のApp Routerでは非対応
  // 動的ルートの処理は各ページのgenerateStaticParamsで行う
};

module.exports = nextConfig;