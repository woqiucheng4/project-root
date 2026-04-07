"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type WfRow = {
  id: string;
  title: string | null;
  status: string;
  updatedAt: string;
};

export default function WorkflowsPage() {
  const [rows, setRows] = useState<WfRow[]>([]);
  const [title, setTitle] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/workflows");
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "加载失败");
    setRows(j.workflows);
  }, []);

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, [load]);

  async function createWf(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || null,
          requirementsText: requirements,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "创建失败");
      setTitle("");
      setRequirements("");
      await load();
      window.location.href = `/workflows/${j.workflow.id}`;
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-8 font-sans text-zinc-900 dark:text-zinc-100">
      <h1 className="text-2xl font-semibold">自动编程工作流</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        创建需求 → PM 生成 PRD → 你确认 → 架构与 TODO → 你确认 → 开发/测试闭环 → 验收。
      </p>

      <form onSubmit={createWf} className="mt-8 space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <label className="block text-sm font-medium">标题（可选）</label>
          <input
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：会员积分模块"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">需求描述 *</label>
          <textarea
            required
            rows={6}
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="用自然语言描述你想做的产品功能…"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "创建中…" : "创建工作流"}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-medium">最近工作流</h2>
      <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
        {rows.map((w) => (
          <li key={w.id} className="py-3">
            <Link href={`/workflows/${w.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              {w.title || w.id.slice(0, 8)}
            </Link>
            <span className="ml-2 text-xs text-zinc-500">{w.status}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-4 text-zinc-500">暂无</li>}
      </ul>
    </div>
  );
}
