import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',       // 静的書き出し
  basePath: '/sin471',    // URLのパス（リポジトリ名）
  images: {
    unoptimized: true,    // 静的サイトではNext.jsの画像最適化はオフにする
  },
};

export default nextConfig;
