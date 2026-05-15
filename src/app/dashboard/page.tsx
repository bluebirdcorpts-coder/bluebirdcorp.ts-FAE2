import {
  Package, BrainCircuit, CheckCircle, AlertCircle,
  ArrowUpRight, Zap, BarChart3, Clock,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Header from "@/components/layout/Header";

const STAT_CARDS = [
  {
    label: "등록 제품",
    value: "—",
    hint: "제품 API 연결 후 표시",
    icon: Package,
    accent: "#4f46e5",
    bg: "bg-brand-50",
    iconColor: "text-brand-600",
  },
  {
    label: "AI 분석 완료",
    value: "—",
    hint: "태스크 API 연결 후 표시",
    icon: CheckCircle,
    accent: "#059669",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "실행 중",
    value: "—",
    hint: "현재 진행 중인 작업",
    icon: BrainCircuit,
    accent: "#7c3aed",
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "실패",
    value: "—",
    hint: "오류 발생 작업",
    icon: AlertCircle,
    accent: "#dc2626",
    bg: "bg-red-50",
    iconColor: "text-red-600",
  },
];

const QUICK_ACTIONS = [
  {
    href: "/research",
    label: "AI Research",
    desc: "시장조사 → 기획 → 검증 → PRD 자동 생성",
    icon: BarChart3,
    color: "brand",
  },
  {
    href: "/rfid-proposal",
    label: "RFID 제안서",
    desc: "Bluebird RFID 솔루션 AI 세일즈 제안서 작성",
    icon: Zap,
    color: "violet",
  },
  {
    href: "/ts-dashboard",
    label: "TS Strategy",
    desc: "2026 Technical Sales 팀 운영 전략 대시보드",
    icon: Clock,
    color: "emerald",
  },
];

const PIPELINE_STEPS = [
  { step: "01", label: "시장 조사 Agent", desc: "Tavily 실시간 검색" },
  { step: "02", label: "아이디어 기획 Agent", desc: "3가지 제품 컨셉 생성" },
  { step: "03", label: "검증·비판 Agent", desc: "GO / PIVOT / DROP 판정" },
  { step: "04", label: "PRD 작성 Agent", desc: "완성된 요구사항 정의서" },
];

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  brand:   { bg: "hover:bg-brand-50",   text: "text-brand-600",   border: "hover:border-brand-300",   iconBg: "bg-brand-100" },
  violet:  { bg: "hover:bg-violet-50",  text: "text-violet-600",  border: "hover:border-violet-300",  iconBg: "bg-violet-100" },
  emerald: { bg: "hover:bg-emerald-50", text: "text-emerald-600", border: "hover:border-emerald-300", iconBg: "bg-emerald-100" },
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Header
        title="B-APO Dashboard"
        subtitle="AI-Driven Product Orchestrator — FAE / PM 내부 툴"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, hint, icon: Icon, bg, iconColor }) => (
          <Card key={label} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`${bg} p-2 rounded-lg`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{label}</p>
              <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          빠른 실행
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon, color }) => {
            const c = colorMap[color];
            return (
              <a
                key={href}
                href={href}
                className={`group flex items-start gap-4 bg-white border border-slate-200/80 rounded-xl p-5 transition-all duration-200 ${c.bg} ${c.border}
                  shadow-[0_1px_3px_0_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.09)]`}
              >
                <div className={`${c.iconBg} p-2.5 rounded-lg shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div>
                  <p className={`font-semibold text-slate-800 group-hover:${c.text} transition-colors`}>{label}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* AI Pipeline */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          AI 직원 파이프라인
        </h2>
        <Card className="border-brand-100 bg-gradient-to-br from-brand-50/60 to-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PIPELINE_STEPS.map(({ step, label, desc }, i) => (
              <div key={step} className="flex items-start gap-3">
                {/* Step number + connector */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="hidden md:block w-px h-full bg-brand-200 mt-2" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-semibold text-brand-900">{label}</p>
                  <p className="text-xs text-brand-600/80 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-500/70 mt-5 pt-4 border-t border-brand-100">
            LangGraph 기반 순차 멀티에이전트 워크플로우 · Tavily 실시간 검색 · Claude claude-opus-4-7 생성
          </p>
        </Card>
      </div>
    </div>
  );
}
