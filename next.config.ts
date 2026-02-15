import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  compiler: {
    // 本番環境でconsole.logを削除
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // パフォーマンス最適化
  poweredByHeader: false,
  reactStrictMode: true,
  // 不要なソースマップを無効化（本番ビルドサイズ削減）
  productionBrowserSourceMaps: false,
};

export default nextConfig;
