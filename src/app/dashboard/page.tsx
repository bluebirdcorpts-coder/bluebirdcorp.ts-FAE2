import { Package, BrainCircuit, CheckCircle, AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Header from "@/components/layout/Header";

const STAT_CARDS = [
  {
    label: "등록 제품",
    value: "제품 API 연결 후 표시",
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "AI 분석 완료",
    value: "태스크 API 연결 후 표시",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "실행 중",
    value: "—",
    icon: BrainCircuit,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "실패",
    value: "—",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
];

const QUICK_ACTIONS = [
  { href: "/products", label: "제품 등록", desc: "새로운 제품을 등록합니다" },
  { href: "/analyze", label: "AI 분석 실행", desc: "제품 분석 / 컨텐츠 생성 / 가격 최적화" },
  { href: "/tasks", label: "태스크 현황", desc: "진행 중인 AI 작업을 확인합니다" },
];

export default function DashboardPage() {
  return (
    <div>
      <Header
        title="B-APO Dashboard"
        subtitle="AI-Driven Product Orchestrator — FAE / PM 내부 툴"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className={`${bg} p-2.5 rounded-lg`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-lg font-bold text-gray-800">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
        빠른 실행
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {QUICK_ACTIONS.map(({ href, label, desc }) => (
          <a
            key={href}
            href={href}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-500 hover:shadow-md transition-all group"
          >
            <p className="font-semibold text-gray-900 group-hover:text-brand-600">{label}</p>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </a>
        ))}
      </div>

      {/* AI Employee Pipeline Info */}
      <Card className="border-brand-200 bg-brand-50">
        <h2 className="font-bold text-brand-800 mb-3">AI 직원 파이프라인 (로드맵)</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            "1단계: 시장 조사 Agent",
            "2단계: 아이디어 기획 Agent",
            "3단계: 검증·비판 Agent",
            "4단계: PRD 작성 Agent",
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-white border border-brand-200 rounded-lg px-3 py-2"
            >
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <span className="text-brand-800">{step.replace(/^\d단계: /, "")}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-brand-600 mt-3">
          다음 개발 단계에서 CrewAI 기반 멀티에이전트 워크플로우로 확장 예정
        </p>
      </Card>
    </div>
  );
}
