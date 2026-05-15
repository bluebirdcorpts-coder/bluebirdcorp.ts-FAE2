"use client";

import { useState } from "react";
import { Loader2, FileText, ExternalLink, Download, Copy, Zap, Search, Building2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Card from "@/components/ui/Card";

// ── 타입 ──────────────────────────────────────────────────
interface RFIDProposalResponse {
  company: string;
  industry: string;
  stakeholder: string;
  environment: string | null;
  proposal: string;
  search_sources: { title: string; url: string; content: string }[];
}

// ── 업종 프리셋 ──────────────────────────────────────────
const INDUSTRY_PRESETS = [
  { label: "🧊 콜드체인 / 신선식품", value: "콜드체인 신선식품 배송", env: "냉장·냉동 창고" },
  { label: "🏭 제조·스마트팩토리", value: "제조업 스마트팩토리", env: "금속 혼재 공장" },
  { label: "📦 이커머스 물류", value: "이커머스 풀필먼트 물류", env: "대형 물류센터" },
  { label: "🏥 의료·병원", value: "병원 의료기기 자산 관리", env: "병원 내부" },
  { label: "🛍️ 리테일·패션", value: "리테일 패션 재고 관리", env: "매장·창고" },
  { label: "✈️ 항공·공항", value: "항공 수하물 자산 추적", env: "공항 옥외" },
];

const STAKEHOLDERS = [
  "임원(C-Level)", "물류 CTO", "공급망 SCM팀장", "IT 인프라 담당", "운영 COO", "구매 팀장",
];

// ── 마크다운 간단 렌더러 ─────────────────────────────────
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "24px 0 12px", borderBottom: "1px solid #1e3a5f", paddingBottom: 8 }}>{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontSize: 16, fontWeight: 700, color: "#93c5fd", margin: "20px 0 8px" }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc", margin: "14px 0 6px" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, margin: "3px 0", fontSize: 13, color: "#cbd5e1" }}>
          <span style={{ color: "#3b82f6", flexShrink: 0, marginTop: 1 }}>▸</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </div>
      );
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      elements.push(
        <div key={i} style={{ display: "flex", gap: 8, margin: "4px 0", fontSize: 13, color: "#cbd5e1" }}>
          <span style={{ color: "#6366f1", fontWeight: 700, minWidth: 20, flexShrink: 0 }}>{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\. /, "")) }} />
        </div>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #1e3a5f", margin: "16px 0" }} />);
    } else if (line.startsWith("|")) {
      elements.push(
        <div key={i} style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", padding: "2px 8px", background: "#0f1624", borderLeft: "2px solid #1e3a5f" }}>
          {line}
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={i} style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7, margin: "3px 0" }}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
  });
  return <div>{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#a5b4fc">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#0f1624;padding:1px 5px;border-radius:3px;font-size:11px;color:#86efac">$1</code>');
}

// ── 메인 페이지 ──────────────────────────────────────────
export default function RFIDProposalPage() {
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry]       = useState("");
  const [stakeholder, setStakeholder] = useState("임원(C-Level)");
  const [environment, setEnvironment] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<RFIDProposalResponse | null>(null);
  const [error, setError]             = useState("");
  const [phase, setPhase]             = useState<"search"|"generate"|"done">("done");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setPhase("search");

    try {
      await new Promise(r => setTimeout(r, 800)); // UI 반응성
      setPhase("generate");

      const res = await fetch("/api/v1/rfid/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          industry,
          stakeholder,
          environment: environment || null,
          extra_context: extraContext || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data: RFIDProposalResponse = await res.json();
      setResult(data);
      setPhase("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "오류 발생");
      setPhase("done");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.proposal).then(() => alert("제안서가 클립보드에 복사되었습니다!"));
  }

  function handleDownload() {
    if (!result) return;
    const filename = `RFID_제안서_${result.company}_${new Date().toISOString().slice(0, 10)}.md`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([result.proposal], { type: "text/markdown" }));
    a.download = filename;
    a.click();
  }

  return (
    <div>
      <Header
        title="RFID 제안서 AI 생성"
        subtitle="고객사명 + 산업군 입력 → Tavily 실시간 검색 + Claude AI가 맞춤형 제안서 자동 작성"
      />

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>
        {/* ── 좌측: 입력 폼 ── */}
        <Card>
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 회사명 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                <Building2 size={12} /> 고객사명 *
              </label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="예: 쿠팡물류, OO제약, 신세계푸드"
                required
              />
            </div>

            {/* 업종 프리셋 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
                산업군 (프리셋 선택 또는 직접 입력) *
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                {INDUSTRY_PRESETS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => { setIndustry(p.value); setEnvironment(p.env); }}
                    style={{
                      padding: "4px 10px", borderRadius: 20, border: "1px solid",
                      fontSize: 11, cursor: "pointer", transition: "all .15s",
                      borderColor: industry === p.value ? "#3b82f6" : "#e5e7eb",
                      background: industry === p.value ? "#eff6ff" : "transparent",
                      color: industry === p.value ? "#1d4ed8" : "#6b7280",
                      fontWeight: industry === p.value ? 700 : 400,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="산업군 직접 입력..."
                required
              />
            </div>

            {/* 도입 환경 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
                도입 환경
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={environment}
                onChange={e => setEnvironment(e.target.value)}
                placeholder="예: 금속 혼재 창고, 냉장·냉동 환경, 옥외"
              />
            </div>

            {/* 대상 의사결정자 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
                대상 의사결정자
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={stakeholder}
                onChange={e => setStakeholder(e.target.value)}
              >
                {STAKEHOLDERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* 추가 정보 */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
                추가 알려진 정보 <span style={{ fontWeight: 400, color: "#9ca3af" }}>(선택)</span>
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={3}
                value={extraContext}
                onChange={e => setExtraContext(e.target.value)}
                placeholder="예: 현재 바코드 스캐너 사용 중, 월 5만 개 처리, 오인식 문제 심각..."
              />
            </div>

            {/* 에러 */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                ⚠ {error}
              </div>
            )}

            {/* 실행 버튼 */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "#fff", fontWeight: 700, fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "opacity .2s",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {phase === "search" ? "Tavily 실시간 검색 중..." : "Claude AI 제안서 작성 중..."}
                </>
              ) : (
                <><Zap size={16} /> 제안서 AI 생성</>
              )}
            </button>

            {/* 파이프라인 안내 */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "#94a3b8" }}>
              <div style={{ fontWeight: 700, color: "#475569", marginBottom: 4 }}>🔄 실행 파이프라인</div>
              <div>① Tavily — 3가지 쿼리 실시간 검색</div>
              <div>② Claude AI — 검색 결과 기반 제안서 작성</div>
              <div>③ 마크다운 제안서 + 참조 출처 반환</div>
            </div>
          </form>
        </Card>

        {/* ── 우측: 결과 ── */}
        <div>
          {/* 로딩 */}
          {loading && (
            <Card style={{ textAlign: "center", padding: 60 }}>
              <Loader2 size={40} style={{ margin: "0 auto 16px", color: "#3b82f6", animation: "spin 1s linear infinite" }} />
              <p style={{ fontWeight: 700, color: "#374151" }}>
                {phase === "search" ? "🔎 Tavily로 고객사 정보 수집 중..." : "🤖 Claude AI가 제안서 작성 중..."}
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>
                {phase === "search" ? "실시간 웹 검색 — 3개 쿼리 병렬 실행" : "맞춤형 RFID 제안서 생성 중 (30~60초)"}
              </p>
            </Card>
          )}

          {/* 빈 상태 */}
          {!loading && !result && !error && (
            <Card style={{ textAlign: "center", padding: 60 }}>
              <FileText size={48} style={{ margin: "0 auto 16px", color: "#d1d5db" }} />
              <p style={{ fontWeight: 700, color: "#9ca3af" }}>제안서가 여기에 표시됩니다</p>
              <p style={{ fontSize: 13, color: "#c4c9d4", marginTop: 6 }}>
                좌측에 고객사 정보를 입력하고<br />"제안서 AI 생성" 버튼을 클릭하세요
              </p>
            </Card>
          )}

          {/* 결과 */}
          {result && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 메타 정보 */}
              <Card style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>생성된 제안서</span>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "2px 0" }}>
                      {result.company} — {result.industry}
                    </h2>
                    <p style={{ fontSize: 12, color: "#9ca3af" }}>
                      대상: {result.stakeholder} | 환경: {result.environment || "일반"} | 참조 출처: {result.search_sources.length}건
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCopy}
                      style={{ padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <Copy size={13} /> 복사
                    </button>
                    <button onClick={handleDownload}
                      style={{ padding: "7px 14px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <Download size={13} /> .md 다운로드
                    </button>
                  </div>
                </div>
              </Card>

              {/* 제안서 본문 */}
              <Card>
                <div style={{ padding: "4px 0" }}>
                  <SimpleMarkdown text={result.proposal} />
                </div>
              </Card>

              {/* 참조 출처 */}
              {result.search_sources.length > 0 && (
                <Card>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Search size={14} /> Tavily 실시간 검색 출처 ({result.search_sources.length}건)
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.search_sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", background: "#f9fafb", borderRadius: 8, textDecoration: "none", border: "1px solid #f3f4f6" }}>
                        <ExternalLink size={12} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 3 }} />
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", margin: 0 }}>{s.title}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>{s.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
