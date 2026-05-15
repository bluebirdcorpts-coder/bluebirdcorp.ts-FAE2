"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// 정적 데이터 (실제 운영 시 API로 교체)
// ─────────────────────────────────────────────────────────────

const TEAM = [
  {
    id: "jiyun",
    name: "지윤 (Ji-Yun Kim)",
    email: "jiyun.kim@bluebirdcorp.com",
    color: "#f4a4a4",
    role: "ISV 리드 & 오너십",
    tasks: [
      { label: "ISV Lead-out 및 인티그레이션", progress: 65, status: "running" },
      { label: "정기 보고 및 협업 부서 통보", progress: 80, status: "done" },
      { label: "오너십 기반 리딩", progress: 70, status: "running" },
    ],
  },
  {
    id: "jeremy",
    name: "Jeremy (이재선)",
    email: "jaesun.lee@bluebirdcorp.com",
    color: "#fce8b2",
    role: "팀 리딩 & OKR 관리",
    tasks: [
      { label: "팀 전체 OKR 조율", progress: 75, status: "running" },
      { label: "사장님 직접 보고", progress: 85, status: "done" },
      { label: "부서 간 협업 리딩", progress: 60, status: "running" },
    ],
  },
  {
    id: "jongin",
    name: "Jong-In Kim (김종인)",
    email: "jongin.kim@bluebirdcorp.com",
    color: "#b6d7a8",
    role: "솔루션 기술 지원",
    tasks: [
      { label: "신규 ISV 솔루션 리스트업", progress: 55, status: "running" },
      { label: "단말기 인티그레이션 테스트", progress: 40, status: "pending" },
      { label: "기술 문서 작성", progress: 90, status: "done" },
    ],
  },
  {
    id: "heeyoung",
    name: "Hee-Young Cho (조희영)",
    email: "heeyoung.cho@bluebirdcorp.com",
    color: "#a4c2f4",
    role: "프로젝트 딜리버리",
    tasks: [
      { label: "프로젝트 딜리버리 관리", progress: 78, status: "running" },
      { label: "Success Story 작성", progress: 50, status: "pending" },
      { label: "Win-back 전략 수립", progress: 35, status: "pending" },
    ],
  },
  {
    id: "seungeun",
    name: "Seung-Eun Kim (김승은)",
    email: "seungeun.kim@bluebirdcorp.com",
    color: "#d9a4f4",
    role: "전시회 & 파트너",
    tasks: [
      { label: "전시회 콜라보레이션 플랜", progress: 45, status: "pending" },
      { label: "파트너사 협업 관리", progress: 70, status: "running" },
      { label: "OKR 전시회 항목 반영", progress: 60, status: "running" },
    ],
  },
];

const OKR_LIST = [
  {
    id: 1,
    objective: "프로젝트 위닝 전략 도구화",
    keyResults: [
      { kr: "위닝 기술 도구 3종 이상 개발 및 배포", progress: 67, highlight: true },
      { kr: "Win-back 케이스 스터디 2건 완료", progress: 50, highlight: false },
    ],
    owner: "Jeremy",
    priority: "high",
  },
  {
    id: 2,
    objective: "ISV 솔루션 고도화 및 노출 확대",
    keyResults: [
      { kr: "신규 솔루션 3개 이상 인티그레이션 완료", progress: 40, highlight: false },
      { kr: "솔루션 리스트 10종 이상 정비 및 카탈로그화", progress: 75, highlight: false },
    ],
    owner: "지윤",
    priority: "high",
  },
  {
    id: 3,
    objective: "전시회 파트너 콜라보레이션",
    keyResults: [
      { kr: "전시회 시연 파트너 2곳 이상 확정", progress: 55, highlight: false },
      { kr: "OKR 전시회 항목 명확 반영", progress: 80, highlight: false },
    ],
    owner: "Seung-Eun",
    priority: "medium",
  },
  {
    id: 4,
    objective: "TS 기여 매출 점유율 확대",
    keyResults: [
      { kr: "TS 관여 프로젝트 매출 기여 주장 건수 20건+", progress: 72, highlight: false },
      { kr: "대형 프로젝트 우선 선택 관리 체계 수립", progress: 65, highlight: false },
    ],
    owner: "Jeremy",
    priority: "high",
  },
  {
    id: 5,
    objective: "전략적 레퍼런스 발굴 (쿠팡 RFID 등)",
    keyResults: [
      { kr: "고부가가치 레퍼런스 프로젝트 3건 하이라이트", progress: 83, highlight: true },
      { kr: "미래 먹거리 파이프라인 5건 이상 확보", progress: 40, highlight: false },
    ],
    owner: "지윤",
    priority: "medium",
  },
];

const REVENUE_PROJECTS = [
  { name: "쿠팡 물류 자동화", amount: "₩ 4.8억", ts_share: 82, status: "진행중", type: "revenue" },
  { name: "SPC 리테일 솔루션", amount: "₩ 2.1억", ts_share: 70, status: "완료", type: "revenue" },
  { name: "킨텍스 전시 단말 공급", amount: "₩ 1.5억", ts_share: 60, status: "협의", type: "revenue" },
  { name: "보스턴사이언틱 납품", amount: "₩ 3.2억", ts_share: 90, status: "진행중", type: "revenue" },
];

const STRATEGIC_PROJECTS = [
  {
    name: "쿠팡 RFID 고정형",
    value: "레퍼런스 최고",
    note: "수량은 적으나 확장성·레퍼런스 가치 높음",
    highlight: true,
    badge: "사장님 인정",
  },
  {
    name: "프린터 솔루션 실적",
    value: "신규 버티컬",
    note: "프린터 관련 실적 누적 — 미래 먹거리",
    highlight: false,
    badge: "성장 중",
  },
  {
    name: "ISV 신규 인티그레이션",
    value: "솔루션 시너지",
    note: "단말기 + ISV 결합 신규 솔루션 라인업",
    highlight: false,
    badge: "개발 중",
  },
];

// ─────────────────────────────────────────────────────────────
// 유틸 컴포넌트
// ─────────────────────────────────────────────────────────────

function ProgressBar({ value, target = 70, showTarget = true, color = "#3b82f6" }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const barColor =
    pct >= 80 ? "#22c55e" : pct >= 70 ? "#3b82f6" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          background: "#e5e7eb",
          borderRadius: 9999,
          height: 8,
          position: "relative",
          overflow: "visible",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: barColor,
            height: "100%",
            borderRadius: 9999,
            transition: "width 0.6s ease",
          }}
        />
        {/* 70% 기준선 */}
        {showTarget && (
          <div
            style={{
              position: "absolute",
              left: `${target}%`,
              top: -4,
              bottom: -4,
              width: 2,
              background: "#9ca3af",
              borderRadius: 1,
            }}
            title={`목표 기준 ${target}%`}
          />
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    done: { label: "완료", bg: "#dcfce7", color: "#166534" },
    running: { label: "진행중", bg: "#dbeafe", color: "#1e40af" },
    pending: { label: "예정", bg: "#fef9c3", color: "#713f12" },
    high: { label: "높음", bg: "#fee2e2", color: "#991b1b" },
    medium: { label: "보통", bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status] || { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 8px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

function Card({ children, style = {}, className = "" }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ number, title, subtitle, color = "#1e3a8a" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: color,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "#6b7280", margin: "2px 0 0" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 섹션 1: TS 역할 재정의
// ─────────────────────────────────────────────────────────────

function Section1Roles() {
  const roles = [
    {
      icon: "🏆",
      title: "프로젝트 위닝 (Winning)",
      desc: "단순 지원을 넘어 수주 전략을 직접 수립·실행. Success Story & Win-back 주도.",
      kpi: "위닝 전략 도구 개발 중",
      color: "#eff6ff",
      border: "#93c5fd",
    },
    {
      icon: "📦",
      title: "프로덕트 매니지먼트 (PM)",
      desc: "기술 영업 범위를 넘어 제품 기획·관리 영역까지 역할 확장 수행.",
      kpi: "B-APO 시스템 연동 예정",
      color: "#f0fdf4",
      border: "#86efac",
    },
    {
      icon: "🚀",
      title: "딜리버리 주도",
      desc: "FAE팀 딜리버리 업무까지 TS가 실질적으로 주도. 프로젝트 완결성 책임.",
      kpi: "현재 4건 딜리버리 진행중",
      color: "#faf5ff",
      border: "#c4b5fd",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 16,
      }}
    >
      {roles.map((r) => (
        <div
          key={r.title}
          style={{
            background: r.color,
            border: `1.5px solid ${r.border}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>{r.icon}</div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
            {r.title}
          </h3>
          <p style={{ fontSize: 13, color: "#4b5563", margin: "0 0 12px", lineHeight: 1.5 }}>
            {r.desc}
          </p>
          <span
            style={{
              fontSize: 11,
              background: "rgba(255,255,255,0.8)",
              border: `1px solid ${r.border}`,
              borderRadius: 6,
              padding: "3px 8px",
              color: "#374151",
            }}
          >
            {r.kpi}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 섹션 2: 이원화된 대시보드
// ─────────────────────────────────────────────────────────────

function Section2DualDashboard() {
  const [active, setActive] = useState("revenue");

  return (
    <div>
      {/* 탭 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { id: "revenue", label: "📊 제1 대시보드: 매출 기반 성과" },
          { id: "strategic", label: "⭐ 제2 대시보드: 전략적 가치 & 레퍼런스" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              background: active === tab.id ? "#1e3a8a" : "#f3f4f6",
              color: active === tab.id ? "#fff" : "#374151",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 제1: 매출 */}
      {active === "revenue" && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            TS 관여 프로젝트 매출 기여도 — 영업팀과 협업하여 적극적으로 '주장' 중
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {REVENUE_PROJECTS.map((p) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "#f9fafb",
                  borderRadius: 10,
                  padding: "14px 18px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{p.name}</span>
                    <StatusBadge status={p.status === "완료" ? "done" : p.status === "진행중" ? "running" : "pending"} />
                  </div>
                  <ProgressBar value={p.ts_share} />
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#1e3a8a", margin: 0 }}>{p.amount}</p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>TS 기여 {p.ts_share}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 제2: 전략적 가치 */}
      {active === "strategic" && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            매출보다 레퍼런스·파급력 우선 — 사장님 직접 하이라이트 항목 포함
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            {STRATEGIC_PROJECTS.map((p) => (
              <div
                key={p.name}
                style={{
                  background: p.highlight ? "#fefce8" : "#fff",
                  border: p.highlight ? "2px solid #facc15" : "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 18,
                  position: "relative",
                }}
              >
                {p.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: -10,
                      right: 12,
                      background: "#facc15",
                      color: "#713f12",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 9999,
                    }}
                  >
                    ⭐ {p.badge}
                  </div>
                )}
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                  {p.name}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    background: "#dbeafe",
                    color: "#1e40af",
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontWeight: 600,
                  }}
                >
                  {p.value}
                </span>
                <p style={{ fontSize: 13, color: "#4b5563", margin: "10px 0 0", lineHeight: 1.5 }}>
                  {p.note}
                </p>
                {!p.highlight && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      fontSize: 11,
                      background: "#f3f4f6",
                      color: "#374151",
                      borderRadius: 6,
                      padding: "2px 8px",
                    }}
                  >
                    {p.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 섹션 3: 핵심 실행 과제
// ─────────────────────────────────────────────────────────────

function Section3KeyTasks() {
  const tasks = [
    {
      icon: "🛠️",
      title: "위닝 전략 도구화",
      note: "사장님 직접 지시",
      steps: ["현황 분석", "도구 설계", "개발", "배포"],
      current: 2,
      color: "#fee2e2",
      accent: "#ef4444",
      owner: "Jeremy",
    },
    {
      icon: "🔗",
      title: "ISV 솔루션 고도화",
      note: "신규 솔루션 연동 및 리스트업",
      steps: ["기존 정비", "신규 발굴", "인티그레이션", "노출"],
      current: 1,
      color: "#eff6ff",
      accent: "#3b82f6",
      owner: "지윤",
    },
    {
      icon: "🎪",
      title: "전시회 콜라보레이션",
      note: "파트너사 협업 + OKR 반영",
      steps: ["파트너 선정", "시연 플랜", "OKR 등록", "실행"],
      current: 1,
      color: "#f0fdf4",
      accent: "#22c55e",
      owner: "Seung-Eun",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {tasks.map((t) => (
        <div
          key={t.title}
          style={{
            background: t.color,
            border: `1.5px solid ${t.accent}30`,
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{t.title}</span>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    background: t.accent,
                    color: "#fff",
                    borderRadius: 6,
                    padding: "1px 7px",
                    fontWeight: 600,
                  }}
                >
                  {t.note}
                </span>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>담당: {t.owner}</span>
          </div>

          {/* 스텝 진행도 */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {t.steps.map((step, i) => {
              const done = i < t.current;
              const active = i === t.current;
              return (
                <div
                  key={step}
                  style={{ display: "flex", alignItems: "center", flex: 1 }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: done ? t.accent : active ? "#fff" : "#e5e7eb",
                        border: active ? `2.5px solid ${t.accent}` : done ? "none" : "2px solid #d1d5db",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: done ? "#fff" : active ? t.accent : "#9ca3af",
                        boxShadow: active ? `0 0 0 3px ${t.accent}25` : "none",
                        flexShrink: 0,
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        marginTop: 4,
                        color: done || active ? "#374151" : "#9ca3af",
                        fontWeight: active ? 700 : 400,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {step}
                    </span>
                  </div>
                  {i < t.steps.length - 1 && (
                    <div
                      style={{
                        height: 2,
                        flex: 1,
                        background: i < t.current ? t.accent : "#e5e7eb",
                        marginBottom: 20,
                        marginTop: -4,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 섹션 4: OKR 현황
// ─────────────────────────────────────────────────────────────

function Section4OKR() {
  const [expanded, setExpanded] = useState(null);

  const avgProgress =
    OKR_LIST.reduce(
      (sum, o) =>
        sum + o.keyResults.reduce((s, kr) => s + kr.progress, 0) / o.keyResults.length,
      0
    ) / OKR_LIST.length;

  return (
    <div>
      {/* 전체 요약 */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          borderRadius: 12,
          padding: "18px 22px",
          marginBottom: 20,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p style={{ fontSize: 13, margin: "0 0 4px", opacity: 0.8 }}>전체 OKR 평균 달성률</p>
          <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{avgProgress.toFixed(0)}%</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 8,
              padding: "8px 16px",
            }}
          >
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>사장님 가이드라인</p>
            <p style={{ margin: "2px 0 0", fontWeight: 700, fontSize: 14 }}>
              70~80% 달성 = 성과 인정 ✓
            </p>
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 9999, height: 10, position: "relative" }}>
            <div
              style={{
                width: `${avgProgress}%`,
                background: avgProgress >= 70 ? "#4ade80" : "#facc15",
                height: "100%",
                borderRadius: 9999,
                transition: "width 0.6s",
              }}
            />
            {/* 70% 기준선 */}
            {[70, 80].map((line) => (
              <div
                key={line}
                style={{
                  position: "absolute",
                  left: `${line}%`,
                  top: -3,
                  bottom: -3,
                  width: 2,
                  background: "rgba(255,255,255,0.6)",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: -18,
                    left: -8,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.7)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {line}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OKR 목록 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {OKR_LIST.map((okr) => {
          const avg =
            okr.keyResults.reduce((s, kr) => s + kr.progress, 0) / okr.keyResults.length;
          const isOpen = expanded === okr.id;

          return (
            <div
              key={okr.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
                background: okr.keyResults.some((kr) => kr.highlight) ? "#fefce8" : "#fff",
              }}
            >
              {/* 헤더 */}
              <div
                onClick={() => setExpanded(isOpen ? null : okr.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  cursor: "pointer",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                      O{okr.id}. {okr.objective}
                    </span>
                    <StatusBadge status={okr.priority} />
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{okr.owner}</span>
                  </div>
                  <ProgressBar value={avg} />
                </div>
                <div
                  style={{
                    minWidth: 48,
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: 16,
                    color: avg >= 70 ? "#22c55e" : avg >= 40 ? "#f59e0b" : "#ef4444",
                  }}
                >
                  {avg.toFixed(0)}%
                </div>
                <span style={{ color: "#9ca3af", fontSize: 18 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {/* 펼치면 KR 상세 */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 18px 16px",
                    borderTop: "1px solid #f3f4f6",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                    {okr.keyResults.map((kr, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 12,
                            color: "#6b7280",
                            minWidth: 28,
                          }}
                        >
                          KR{i + 1}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ fontSize: 13, color: "#374151" }}>
                              {kr.kr}
                              {kr.highlight && (
                                <span style={{ marginLeft: 6, color: "#eab308" }}>⭐</span>
                              )}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color:
                                  kr.progress >= 70
                                    ? "#22c55e"
                                    : kr.progress >= 40
                                    ? "#f59e0b"
                                    : "#ef4444",
                              }}
                            >
                              {kr.progress}%
                            </span>
                          </div>
                          <ProgressBar value={kr.progress} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 섹션 5: 팀원별 Progress
// ─────────────────────────────────────────────────────────────

function Section5TeamProgress() {
  const [selected, setSelected] = useState("jiyun");
  const member = TEAM.find((m) => m.id === selected);

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* 팀원 선택 사이드바 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
        {TEAM.map((m) => {
          const avgProg =
            m.tasks.reduce((s, t) => s + t.progress, 0) / m.tasks.length;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: selected === m.id ? "2px solid #1e3a8a" : "1.5px solid #e5e7eb",
                borderRadius: 10,
                background: selected === m.id ? "#eff6ff" : "#fff",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: m.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                {m.name[0]}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#111827",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {m.name.split(" ")[0]}
                </p>
                <div style={{ marginTop: 4 }}>
                  <ProgressBar value={avgProg} showTarget={false} />
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color:
                    avgProg >= 70 ? "#22c55e" : avgProg >= 40 ? "#f59e0b" : "#ef4444",
                  flexShrink: 0,
                }}
              >
                {avgProg.toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* 선택된 팀원 상세 */}
      {member && (
        <div style={{ flex: 1, minWidth: 280 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
              padding: "14px 18px",
              background: member.color + "40",
              borderRadius: 12,
              border: `1.5px solid ${member.color}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: member.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                border: "2px solid rgba(0,0,0,0.1)",
              }}
            >
              {member.name[0]}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#111827" }}>
                {member.name}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{member.role}</p>
              <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9ca3af" }}>{member.email}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {member.tasks.map((task) => (
              <div
                key={task.label}
                style={{
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>
                    {task.label}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatusBadge status={task.status} />
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color:
                          task.progress >= 70
                            ? "#22c55e"
                            : task.progress >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      {task.progress}%
                    </span>
                  </div>
                </div>
                <ProgressBar value={task.progress} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인 Dashboard
// ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    {
      number: "1",
      title: "TS 팀 역할 재정의 — Total Ownership",
      subtitle: "프로젝트 위닝 · PM 확대 · 딜리버리 주도",
      color: "#1e3a8a",
      content: <Section1Roles />,
    },
    {
      number: "2",
      title: "이원화된 대시보드 운영",
      subtitle: "제1: 매출 기반 성과 | 제2: 전략적 가치 & 레퍼런스",
      color: "#0f766e",
      content: <Section2DualDashboard />,
    },
    {
      number: "3",
      title: "핵심 실행 과제: 도구화 및 솔루션 시너지",
      subtitle: "위닝 전략 도구화 · ISV 솔루션 고도화 · 전시회 콜라보레이션",
      color: "#7c3aed",
      content: <Section3KeyTasks />,
    },
    {
      number: "4",
      title: "OKR 운용 현황",
      subtitle: "도전적 목표 설정 — 70~80% 달성 = 성과 인정 (사장님 가이드)",
      color: "#b45309",
      content: <Section4OKR />,
    },
    {
      number: "5",
      title: "팀원별 할당 및 Progress",
      subtitle: "Jeremy · 김종인 · 조희영 · 김승은 · 지윤",
      color: "#be185d",
      content: <Section5TeamProgress />,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "-apple-system, 'Noto Sans KR', sans-serif",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "#fff",
          padding: "28px 40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 6,
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                BLUEBIRD CORP · FAE TEAM 2
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: -0.5 }}>
              2026 Technical Sales 팀 운영 전략 Dashboard
            </h1>
            <p style={{ margin: 0, opacity: 0.75, fontSize: 14 }}>
              [최종본] 확정 5대 전략 항목 기반 실시간 현황판
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, opacity: 0.6, fontSize: 12 }}>기준일</p>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{today}</p>
          </div>
        </div>
      </div>

      {/* 바디 */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 40px 60px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {sections.map((sec) => (
          <Card key={sec.number}>
            <SectionTitle
              number={sec.number}
              title={sec.title}
              subtitle={sec.subtitle}
              color={sec.color}
            />
            {sec.content}
          </Card>
        ))}

        {/* 푸터 */}
        <div style={{ textAlign: "center", paddingTop: 12 }}>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>
            Powered by Bluebird B-APO · 데이터는 API 연동 후 실시간 업데이트 됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
