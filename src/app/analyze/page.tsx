"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrainCircuit, Loader2, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { OrchestrateResponse, TaskType } from "@/lib/types";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const TASK_TYPES: { value: TaskType; label: string; desc: string }[] = [
  { value: "product_analysis", label: "제품 분석 (SWOT)", desc: "강점·약점·기회·추천사항 도출" },
  { value: "content_generation", label: "컨텐츠 생성", desc: "제품 설명·태그·SEO 키워드 생성" },
  { value: "pricing_optimization", label: "가격 최적화", desc: "최적 가격 범위와 전략 제안" },
  { value: "competitive_research", label: "경쟁사 분석", desc: "시장 포지셔닝·경쟁사·차별화 요소" },
  { value: "trend_analysis", label: "트렌드 분석", desc: "현재·신흥·쇠퇴 트렌드 리포트" },
];

function AnalyzeForm() {
  const params = useSearchParams();
  const [taskType, setTaskType] = useState<TaskType>("product_analysis");
  const [productName, setProductName] = useState(params.get("product_name") ?? "");
  const [productData, setProductData] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<OrchestrateResponse | null>(null);
  const [error, setError] = useState("");

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setError("");
    setResult(null);
    try {
      let parsedData: Record<string, unknown> = {};
      if (productData.trim()) {
        try { parsedData = JSON.parse(productData); } catch { parsedData = { notes: productData }; }
      }
      const res = await api.orchestrate.run({
        task_type: taskType,
        payload: { product_name: productName, product_data: parsedData, analysis_type: taskType },
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "실행 오류");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">분석 설정</h2>
        <form onSubmit={handleRun} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">분석 유형</label>
            <div className="mt-2 space-y-2">
              {TASK_TYPES.map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    taskType === value
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="task_type"
                    value={value}
                    checked={taskType === value}
                    onChange={() => setTaskType(value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">제품명 *</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Bluebird X1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              추가 데이터 <span className="text-gray-400">(JSON 또는 텍스트)</span>
            </label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              rows={4}
              value={productData}
              onChange={(e) => setProductData(e.target.value)}
              placeholder={'{"category": "hardware", "price": 299.99, "features": ["AI", "5G"]}'}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <XCircle className="w-4 h-4" /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={running}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {running ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> AI 분석 중...</>
            ) : (
              <><BrainCircuit className="w-4 h-4" /> 분석 실행</>
            )}
          </button>
        </form>
      </Card>

      {/* Result Panel */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">분석 결과</h2>
        {!result && !running && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <BrainCircuit className="w-12 h-12 mb-3" />
            <p className="text-sm">왼쪽에서 분석을 실행하세요</p>
          </div>
        )}
        {running && (
          <div className="flex flex-col items-center justify-center h-64 text-brand-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p className="text-sm">Claude AI가 분석 중입니다...</p>
          </div>
        )}
        {result && <ResultView result={result} />}
      </Card>
    </div>
  );
}

function ResultView({ result }: { result: OrchestrateResponse }) {
  const r = result.result as Record<string, unknown> | null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge
          label={result.status}
          variant={result.status === "completed" ? "green" : result.status === "failed" ? "red" : "yellow"}
        />
        <span className="text-xs text-gray-400">Task #{result.task_id}</span>
        {result.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
      </div>

      {result.status === "failed" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{result.message}</p>
      )}

      {r && (
        <div className="space-y-3 text-sm">
          {r.summary && (
            <div>
              <p className="font-medium text-gray-700 mb-1">요약</p>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-3">{r.summary as string}</p>
            </div>
          )}
          {(r.strengths as string[] | undefined)?.length && (
            <ResultList label="강점" items={r.strengths as string[]} color="green" />
          )}
          {(r.weaknesses as string[] | undefined)?.length && (
            <ResultList label="약점" items={r.weaknesses as string[]} color="red" />
          )}
          {(r.opportunities as string[] | undefined)?.length && (
            <ResultList label="기회" items={r.opportunities as string[]} color="blue" />
          )}
          {(r.recommendations as string[] | undefined)?.length && (
            <ResultList label="추천사항" items={r.recommendations as string[]} color="purple" />
          )}
          {(r.insights as string[] | undefined)?.length && (
            <ResultList label="인사이트" items={r.insights as string[]} color="blue" />
          )}
          {r.confidence_score != null && (
            <div>
              <p className="font-medium text-gray-700 mb-1">신뢰도</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-brand-500 rounded-full"
                    style={{ width: `${(r.confidence_score as number) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {((r.confidence_score as number) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}
          {r.raw_output && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-400">Raw 출력 보기</summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg overflow-auto text-gray-600 whitespace-pre-wrap">
                {r.raw_output as string}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function ResultList({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}) {
  const dot: Record<string, string> = {
    green: "bg-green-400",
    red: "bg-red-400",
    blue: "bg-blue-400",
    purple: "bg-purple-400",
  };
  return (
    <div>
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot[color] ?? "bg-gray-400"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <div>
      <Header
        title="AI Analyze"
        subtitle="Claude AI 기반 제품 분석 실행"
      />
      <Suspense fallback={<p className="text-gray-400 text-sm">로딩 중...</p>}>
        <AnalyzeForm />
      </Suspense>
    </div>
  );
}
