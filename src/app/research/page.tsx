"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import {
  Search, Clock, Database, Sheet, Loader2, CheckCircle,
  XCircle, ExternalLink, Trash2, ChevronDown, ChevronUp, FileText
} from "lucide-react";
import { api } from "@/lib/api";
import type { ResearchJobRead, ResearchJobSummary, SaveTarget } from "@/lib/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

// ── 상태 색상 ────────────────────────────────────────────────

const STATUS_VARIANT: Record<string, "green" | "blue" | "yellow" | "red" | "gray" | "purple"> = {
  completed: "green",
  running: "blue",
  scheduled: "purple",
  pending: "yellow",
  failed: "red",
};

const STATUS_LABEL: Record<string, string> = {
  completed: "완료",
  running: "실행 중",
  scheduled: "예약됨",
  pending: "대기",
  failed: "실패",
};

// ── 날짜 포맷 ─────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// ════════════════════════════════════════════════════════════
// 검색 입력 폼
// ════════════════════════════════════════════════════════════

function SearchForm({ onCreated }: { onCreated: () => void }) {
  const [topic, setTopic] = useState("");
  const [saveTarget, setSaveTarget] = useState<SaveTarget>("both");
  const [useSchedule, setUseSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.research.create({
        topic: topic.trim(),
        save_target: saveTarget,
        scheduled_at: useSchedule && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      setTopic("");
      setScheduledAt("");
      setUseSchedule(false);
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-8 border-brand-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Topic Input */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              placeholder="조사할 주제를 입력하세요 (예: 2025 한국 스마트홈 시장 동향)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "실행 중..." : "AI 조사 시작"}
          </button>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {/* Save Target */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">저장:</span>
            {(["both", "db", "sheets"] as const).map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="save_target"
                  value={t}
                  checked={saveTarget === t}
                  onChange={() => setSaveTarget(t)}
                  className="text-brand-600"
                />
                <span className={saveTarget === t ? "text-brand-700 font-medium" : "text-gray-600"}>
                  {t === "both" ? (
                    <span className="flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />+
                      <Sheet className="w-3.5 h-3.5" /> 모두
                    </span>
                  ) : t === "db" ? (
                    <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" /> DB만</span>
                  ) : (
                    <span className="flex items-center gap-1"><Sheet className="w-3.5 h-3.5" /> 구글시트만</span>
                  )}
                </span>
              </label>
            ))}
          </div>

          {/* Schedule Toggle */}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">예약 실행</span>
            <input
              type="checkbox"
              checked={useSchedule}
              onChange={(e) => setUseSchedule(e.target.checked)}
              className="rounded"
            />
          </label>
        </div>

        {/* Datetime Picker */}
        {useSchedule && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <label className="text-sm text-amber-800 font-medium">실행 예약 시간</label>
            <input
              type="datetime-local"
              className="border border-amber-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required={useSchedule}
            />
            <span className="text-xs text-amber-600">서버 시간 기준 (UTC)</span>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-red-600 text-sm">
            <XCircle className="w-4 h-4" /> {error}
          </p>
        )}
      </form>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// 결과 상세 뷰 (폴딩)
// ════════════════════════════════════════════════════════════

function ResearchDetail({ jobId }: { jobId: number }) {
  const { data: job, isLoading } = useSWR<ResearchJobRead>(
    `research:${jobId}`,
    () => api.research.get(jobId),
    { refreshInterval: (j) => (j?.status === "running" || j?.status === "pending" ? 2000 : 0) }
  );

  if (isLoading) return <p className="text-xs text-gray-400 px-2 py-1">로딩 중...</p>;
  if (!job) return null;

  if (job.status === "running" || job.status === "pending") {
    return (
      <div className="flex items-center gap-2 text-brand-600 text-sm px-2 py-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        AI 에이전트가 조사 중입니다... (자동 갱신)
      </div>
    );
  }

  if (job.status === "failed") {
    return <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{job.error}</p>;
  }

  if (job.status === "scheduled") {
    return (
      <p className="text-amber-700 text-sm bg-amber-50 rounded-lg px-3 py-2">
        예약 시간: {fmtDate(job.scheduled_at)} 에 자동 실행됩니다.
      </p>
    );
  }

  if (job.status !== "completed") return null;

  const research = job.result_research as Record<string, unknown> | null;
  const ideation = job.result_ideation;
  const validation = job.result_validation;

  return (
    <div className="space-y-5 text-sm">
      {/* Stage 1 — Market Research */}
      {research && (
        <Section title="1단계: 시장 조사" color="blue">
          <KeyValue label="시장 개요" value={research.market_overview as string} />
          <KeyValue label="시장 규모" value={research.market_size_estimate as string} />
          <TagList label="주요 트렌드" items={research.key_trends as string[]} color="blue" />
          <TagList label="고통점" items={research.pain_points as string[]} color="red" />
          <TagList label="기회" items={research.opportunities as string[]} color="green" />
        </Section>
      )}

      {/* Stage 2 — Ideation */}
      {ideation && (
        <Section title="2단계: 제품 컨셉" color="purple">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {ideation.concepts?.map((c, i) => (
              <div
                key={i}
                className={`rounded-lg border p-3 ${
                  i === ideation.recommended_concept
                    ? "border-brand-400 bg-brand-50 ring-1 ring-brand-400"
                    : "border-gray-200"
                }`}
              >
                {i === ideation.recommended_concept && (
                  <span className="text-xs bg-brand-600 text-white rounded-full px-2 py-0.5 mb-1.5 inline-block">
                    추천
                  </span>
                )}
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-500 italic mb-2">{c.tagline}</p>
                <p className="text-xs text-gray-600 mb-2">{c.description}</p>
                <p className="text-xs text-gray-500">수익 모델: {c.revenue_model}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Stage 3 — Validation */}
      {validation && (
        <Section title="3단계: 검증 결과" color="amber">
          {validation.evaluations?.map((ev, i) => (
            <div key={i} className="flex items-start gap-3 border rounded-lg p-3 mb-2">
              <div className="text-center shrink-0 w-16">
                <p className="text-xs text-gray-400">컨셉 {ev.concept_index + 1}</p>
                <VerdictBadge verdict={ev.verdict} />
              </div>
              <div className="flex-1">
                <div className="flex gap-4 mb-2">
                  <ScoreBar label="실현가능성" score={ev.feasibility_score} />
                  <ScoreBar label="시장적합성" score={ev.market_fit_score} />
                </div>
                <TagList label="리스크" items={ev.risks} color="red" />
              </div>
            </div>
          ))}
          <p className="mt-2 text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium">최종 추천:</span> {validation.final_recommendation}
          </p>
        </Section>
      )}

      {/* Stage 4 — PRD */}
      {job.result_prd && (
        <Section title="4단계: PRD (제품 요구사항 정의서)" color="green">
          <pre className="whitespace-pre-wrap text-xs font-mono text-gray-700 bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto leading-relaxed">
            {job.result_prd}
          </pre>
          <button
            onClick={() => {
              const blob = new Blob([job.result_prd!], { type: "text/markdown" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `PRD_${job.topic.slice(0, 30).replace(/\s/g, "_")}.md`;
              a.click();
            }}
            className="mt-2 flex items-center gap-1.5 text-brand-600 hover:underline text-xs"
          >
            <FileText className="w-3.5 h-3.5" /> PRD 다운로드 (.md)
          </button>
        </Section>
      )}

      {/* Sources */}
      {job.search_sources && job.search_sources.length > 0 && (
        <Section title="참조 출처" color="gray">
          <ul className="space-y-1">
            {job.search_sources.slice(0, 8).map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Sheets Link */}
      {job.saved_to_sheets && job.sheets_url && (
        <a
          href={job.sheets_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-green-800 text-sm hover:bg-green-100 transition-colors"
        >
          <Sheet className="w-4 h-4" />
          구글 시트에서 전체 리포트 보기
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </a>
      )}
    </div>
  );
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const borders: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/30",
    purple: "border-purple-200 bg-purple-50/30",
    amber: "border-amber-200 bg-amber-50/30",
    green: "border-green-200 bg-green-50/30",
    gray: "border-gray-200",
  };
  const titles: Record<string, string> = {
    blue: "text-blue-800", purple: "text-purple-800",
    amber: "text-amber-800", green: "text-green-800", gray: "text-gray-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${borders[color] ?? ""}`}>
      <p className={`font-semibold mb-3 ${titles[color] ?? "text-gray-800"}`}>{title}</p>
      {children}
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="mb-2">
      <span className="text-xs font-medium text-gray-500">{label}: </span>
      <span className="text-xs text-gray-700">{value}</span>
    </div>
  );
}

function TagList({ label, items, color }: { label: string; items: string[] | undefined; color: string }) {
  if (!items?.length) return null;
  const dot: Record<string, string> = { blue: "bg-blue-400", red: "bg-red-400", green: "bg-green-400" };
  return (
    <div className="mb-2">
      <span className="text-xs font-medium text-gray-500">{label}:</span>
      <ul className="mt-1 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot[color] ?? "bg-gray-400"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? "bg-green-400" : pct >= 40 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label} {pct}%</p>
      <div className="h-1.5 bg-gray-200 rounded-full">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    go: { label: "GO ✓", cls: "bg-green-100 text-green-800" },
    pivot: { label: "PIVOT △", cls: "bg-yellow-100 text-yellow-800" },
    drop: { label: "DROP ✗", cls: "bg-red-100 text-red-800" },
  };
  const v = map[verdict] ?? { label: verdict, cls: "bg-gray-100 text-gray-700" };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.cls}`}>{v.label}</span>
  );
}

// ════════════════════════════════════════════════════════════
// 이력 리스트 행
// ════════════════════════════════════════════════════════════

function JobRow({ job, onDelete }: { job: ResearchJobSummary; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-0 overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{job.topic}</p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(job.created_at)}</p>
        </div>
        <Badge
          label={STATUS_LABEL[job.status] ?? job.status}
          variant={STATUS_VARIANT[job.status] ?? "gray"}
        />
        {job.saved_to_sheets && job.sheets_url && (
          <a
            href={job.sheets_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-green-600 hover:text-green-800"
          >
            <Sheet className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="border-t px-5 py-4">
          <ResearchDetail jobId={job.id} />
        </div>
      )}
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// 메인 페이지
// ════════════════════════════════════════════════════════════

export default function ResearchPage() {
  const { data: jobs, mutate: refresh, isLoading } = useSWR<ResearchJobSummary[]>(
    "research-list",
    () => api.research.list(),
    { refreshInterval: 5000 }
  );

  async function handleDelete(id: number) {
    if (!confirm("삭제하시겠습니까?")) return;
    await api.research.delete(id);
    refresh();
  }

  return (
    <div>
      <Header
        title="AI Research"
        subtitle="주제를 입력하면 4단계 AI 직원이 자동으로 시장 조사 → 기획 → 검증 → PRD를 작성합니다"
      />

      {/* 검색 폼 */}
      <SearchForm onCreated={() => refresh()} />

      {/* 이력 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          조사 이력 ({jobs?.length ?? 0}건)
        </h2>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">로딩 중...</p>
      ) : jobs?.length === 0 ? (
        <Card>
          <p className="text-center text-gray-400 py-12 text-sm">
            아직 조사 이력이 없습니다. 위 검색창에 주제를 입력해보세요.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {jobs?.map((job) => (
            <JobRow key={job.id} job={job} onDelete={() => handleDelete(job.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
