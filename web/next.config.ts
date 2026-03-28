import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 指定 workspace 根目录，消除多 lockfile 警告
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
