"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Message = { id: string; role: string; content: string; createdAt: string };

type Workflow = {
  id: string;
  title: string | null;
  status: string;
  requirementsText: string;
  prdMarkdown: string | null;
  architectureMarkdown: string | null;
  todosJson: string | null;
  uatPreviewHint: string | null;
  failReason: string | null;
  messages: Message[];
};

const RUNNING = new Set(["PM_RUNNING", "ARCHITECT_RUNNING", "DEVELOPMENT", "QA_FIXING"]);

function statusZh(s: string) {
  const m: Record<string, string> = {
    DRAFT: "草稿",
    PM_RUNNING: "PM 生成中",
    PRD_REVIEW: "待确认 PRD",
    ARCHITECT_RUNNING: "架构设计中",
    SPEC_REVIEW: "待确认技术方案",
    DEVELOPMENT: "开发中",
    QA_FIXING: "测试未通过，开发修复中",
    UAT_REVIEW: "待你验收效果",
    COMPLETED: "已完成",
    FAILED: "失败",
  };
  return m[s] || s;
}

export default function WorkflowClient({ id }: { id: string }) {
  const [wf, setWf] = useState<Workflow | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [supplement, setSupplement] = useState("");

  const load = useCallback(async () => {
    const r = await fetch(`/api/workflows/${id}`);
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "加载失败");
    setWf(j.workflow);
  }, [id]);

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, [load]);

  useEffect(() => {
    if (!wf || !RUNNING.has(wf.status)) return;
    const t = setInterval(() => {
      load().catch(() => {});
    }, 4000);
    return () => clearInterval(t);
  }, [wf?.status, load, wf]);

  async function post(url: string, body?: object) {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : "{}",
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "请求失败");
      await load();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "错误");
    } finally {
      setBusy(false);
    }
  }

  if (!wf) {
    return (
      <div className="p-8">
        <p>{err || "加载中…"}</p>
        <Link href="/workflows" className="text-blue-600">
          返回列表
        </Link>
      </div>
    );
  }

  let todos: { id: string; title: string; description: string; acceptanceCriteria: string }[] = [];
  try {
    if (wf.todosJson) todos = JSON.parse(wf.todosJson);
  } catch {
    /* ignore */
  }

  return (
    <div className="mx-auto max-w-4xl p-8 font-sans text-zinc-900 dark:text-zinc-100">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link href="/workflows" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            ← 全部工作流
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{wf.title || "工作流"}</h1>
          <p className="text-sm text-zinc-500">
            状态：<strong>{statusZh(wf.status)}</strong> ({wf.status})
          </p>
        </div>
      </div>

      {err && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">{err}</p>}
      {wf.failReason && (
        <p className="mb-4 rounded bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
          失败原因：{wf.failReason}
        </p>
      )}

      <section className="mb-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-medium">1. 需求</h2>
        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
          {wf.requirementsText}
        </pre>
        {wf.status === "DRAFT" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => post(`/api/workflows/${id}/start-pm`)}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              启动 PM 生成 PRD
            </button>
          </div>
        )}
      </section>

      <section className="mb-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-medium">2. 与 PM 讨论（可选）</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          发送你的问题或补充；再点「请求 PM 回复」生成一条 PM 对话（不直接改 PRD）。
        </p>
        <div className="mt-3 max-h-56 space-y-2 overflow-y-auto rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
          {wf.messages.map((m) => (
            <div key={m.id}>
              <span className="font-semibold text-zinc-600 dark:text-zinc-400">{m.role}:</span>{" "}
              <span className="whitespace-pre-wrap">{m.content}</span>
            </div>
          ))}
          {wf.messages.length === 0 && <p className="text-zinc-500">暂无消息</p>}
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            placeholder="输入后点「发送」"
          />
          <button
            type="button"
            disabled={busy || !userMsg.trim()}
            onClick={async () => {
              if (!userMsg.trim()) return;
              setBusy(true);
              setErr(null);
              try {
                const r = await fetch(`/api/workflows/${id}/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: userMsg }),
                });
                const j = await r.json();
                if (!r.ok) throw new Error(j.error);
                setUserMsg("");
                await load();
              } catch (e: unknown) {
                setErr(e instanceof Error ? e.message : "错误");
              } finally {
                setBusy(false);
              }
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          >
            发送
          </button>
          <button
            type="button"
            disabled={busy || wf.status === "PM_RUNNING"}
            onClick={() => post(`/api/workflows/${id}/pm-reply`)}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
          >
            请求 PM 回复
          </button>
        </div>
      </section>

      <section className="mb-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-medium">3. PRD</h2>
        {wf.prdMarkdown ? (
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
            {wf.prdMarkdown}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">尚未生成</p>
        )}
        {wf.status === "PRD_REVIEW" && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium">补充说明后重新生成 PRD</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                value={supplement}
                onChange={(e) => setSupplement(e.target.value)}
              />
              <button
                type="button"
                disabled={busy || !supplement.trim()}
                onClick={() => post(`/api/workflows/${id}/supplement-prd`, { supplement })}
                className="mt-2 rounded-lg border border-zinc-400 px-3 py-2 text-sm"
              >
                合并补充并重新生成 PRD
              </button>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => post(`/api/workflows/${id}/approve-prd`)}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white dark:bg-green-600"
            >
              确认 PRD，进入架构设计
            </button>
          </div>
        )}
      </section>

      <section className="mb-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-lg font-medium">4. 技术方案与 TODO</h2>
        {wf.architectureMarkdown ? (
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
            {wf.architectureMarkdown}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">尚未生成</p>
        )}
        {todos.length > 0 && (
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm">
            {todos.map((t) => (
              <li key={t.id}>
                <div className="font-medium">{t.title}</div>
                <div className="text-zinc-600 dark:text-zinc-400">{t.description}</div>
                <div className="text-xs text-zinc-500">验收：{t.acceptanceCriteria}</div>
              </li>
            ))}
          </ol>
        )}
        {wf.status === "SPEC_REVIEW" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => post(`/api/workflows/${id}/approve-spec`)}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm text-white dark:bg-green-600"
          >
            确认方案，开始开发与测试
          </button>
        )}
      </section>

      {(wf.status === "DEVELOPMENT" || wf.status === "QA_FIXING") && (
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
          <h2 className="text-lg font-medium">5. 开发 / 测试</h2>
          <p className="mt-2 text-sm">
            引擎正在队列中执行 Dev → QA；测试失败会自动回到开发修复。请保持 <code className="rounded bg-white px-1 dark:bg-zinc-900">ai-runtime</code>{" "}
            与 Redis、Docker 可用。
          </p>
        </section>
      )}

      {wf.status === "UAT_REVIEW" && (
        <section className="mb-8 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-950 dark:bg-green-950/30">
          <h2 className="text-lg font-medium">6. 验收</h2>
          <p className="mt-2 text-sm whitespace-pre-wrap">{wf.uatPreviewHint || "本地启动 Web 应用进行验收。"}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => post(`/api/workflows/${id}/uat-confirm`)}
            className="mt-4 rounded-lg bg-green-700 px-4 py-2 text-sm text-white dark:bg-green-600"
          >
            效果满意，标记完成
          </button>
        </section>
      )}

      {wf.status === "COMPLETED" && (
        <p className="rounded-lg bg-green-100 p-4 text-green-900 dark:bg-green-900/40 dark:text-green-100">
          本工作流已标记完成。
        </p>
      )}
    </div>
  );
}
