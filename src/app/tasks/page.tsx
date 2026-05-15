"use client";

import useSWR from "swr";
import { RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Task, TaskStatus } from "@/lib/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const STATUS_VARIANT: Record<TaskStatus, "green" | "yellow" | "red" | "blue" | "gray"> = {
  completed: "green",
  running: "blue",
  pending: "yellow",
  failed: "red",
  cancelled: "gray",
};

const TASK_LABEL: Record<string, string> = {
  product_analysis: "제품 분석",
  content_generation: "컨텐츠 생성",
  pricing_optimization: "가격 최적화",
  competitive_research: "경쟁사 분석",
  trend_analysis: "트렌드 분석",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskRow({ taskId }: { taskId: number }) {
  const { data: task, isLoading } = useSWR<Task>(
    `task:${taskId}`,
    () => api.orchestrate.getTask(taskId),
    { refreshInterval: (t) => (t?.status === "running" || t?.status === "pending" ? 3000 : 0) }
  );

  if (isLoading || !task) return null;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-400">#{task.id}</span>
          <span className="text-sm font-semibold text-gray-800">
            {TASK_LABEL[task.task_type] ?? task.task_type}
          </span>
          <Badge label={task.status} variant={STATUS_VARIANT[task.status]} />
          {task.agent_id && (
            <span className="text-xs text-gray-400 font-mono">{task.agent_id}</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{fmtDate(task.created_at)}</span>
      </div>

      {task.error && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{task.error}</p>
      )}

      {task.result && (
        <details className="text-xs">
          <summary className="cursor-pointer text-brand-600 hover:underline">결과 보기</summary>
          <pre className="mt-2 p-3 bg-gray-50 rounded-lg overflow-auto text-gray-600 whitespace-pre-wrap max-h-48">
            {JSON.stringify(task.result, null, 2)}
          </pre>
        </details>
      )}
    </Card>
  );
}

export default function TasksPage() {
  // In a real app, we'd fetch a paginated task list from the API.
  // For now, show a placeholder with recent task IDs from sessionStorage.
  const recentIds: number[] = [];
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("bap_task_ids");
    if (stored) recentIds.push(...JSON.parse(stored));
  }

  return (
    <div>
      <Header
        title="Tasks"
        subtitle="AI 태스크 실행 이력"
        action={
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 border rounded-lg px-3 py-2"
          >
            <RefreshCw className="w-4 h-4" /> 새로고침
          </button>
        }
      />

      {recentIds.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-12 text-sm">
            아직 실행된 태스크가 없습니다.{" "}
            <a href="/analyze" className="text-brand-600 hover:underline">
              AI 분석
            </a>
            을 먼저 실행해 보세요.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentIds.reverse().map((id) => (
            <TaskRow key={id} taskId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
