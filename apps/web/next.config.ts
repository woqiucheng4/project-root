import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/workflow", "@repo/database", "@repo/ai-agents"],
  serverExternalPackages: ["@prisma/client", "bullmq", "ioredis"],
};

export default nextConfig;
