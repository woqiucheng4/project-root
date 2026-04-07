import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="max-w-lg text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          AI 自动编程 SaaS 控制台
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          从需求、PRD 确认、架构与 TODO、开发测试到验收的完整流水线。请先启动 Postgres、Redis 与{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">ai-runtime</code>。
        </p>
        <Link
          href="/workflows"
          className="mt-8 inline-block rounded-xl bg-zinc-900 px-6 py-3 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          进入工作流
        </Link>
      </main>
    </div>
  );
}
