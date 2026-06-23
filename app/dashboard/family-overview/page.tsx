"use client";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle, Warning, Sparkle, CaretRight, Info, TrendUp, Minus, X, Star, CalendarCheck, Trophy, UserPlus,
} from "@phosphor-icons/react";
import { Flame, Dumbbell, Footprints } from "lucide-react";
import { FEShoe, FEMeat, FEWheat, FEDroplet, FEMoon, FEFlame } from "../components/FluentEmoji";
import {
  getUserLogs,
  getUserSummary,
  getFamilyMembers,
  getMemberSummary,
  logsToWeeklySteps,
  calculateStreak,
  type User,
  type HealthLog,
  type Summary,
  type FamilyMember,
} from "@/lib/api";
import Sidebar from "../components/Sidebar";
import FamilyMemberModal from "../components/FamilyMemberModal";
import AddFamilyModal from "../components/AddFamilyModal";

type ScoreTier = {
  label: string;
  textColor: string;
  bg: string;
  ring: string;
  ringBg: string;
  border: string;
};

function scoreTier(score: number | null): ScoreTier {
  if (score === null) return { label: "No data yet", textColor: "#9AA0AD", bg: "#F5F3F8", ring: "#D8D4DC", ringBg: "#F5F3F8", border: "#E8E4EA" };
  if (score >= 70) return { label: "All good", textColor: "#20A865", bg: "#EAFBF0", ring: "#20A865", ringBg: "#EAFBF0", border: "#BFE8D2" };
  if (score >= 40) return { label: "Needs attention", textColor: "#C9700F", bg: "#FFF4E8", ring: "#FF9F45", ringBg: "#FFF4E8", border: "#FFD9A0" };
  return { label: "Action required", textColor: "#E85C5C", bg: "#FFF1F0", ring: "#FF6B6B", ringBg: "#FFF1F0", border: "#FFCBC4" };
}

function computeScore(summary: Summary | null): number | null {
  if (!summary || !summary.last_logged) return null;
  const stepsPct = Math.min(((summary.avg_steps ?? 0) / 10000) * 100, 100);
  const proteinPct = Math.min(((summary.avg_protein_g ?? 0) / 50) * 100, 100);
  const caloriesPct = Math.min(((summary.avg_calories ?? 0) / 2000) * 100, 100);
  return Math.round(stepsPct * 0.4 + proteinPct * 0.3 + caloriesPct * 0.3);
}

function scoreFromAverages(avgSteps: number, avgProtein: number, avgCalories: number): number {
  const stepsPct = Math.min((avgSteps / 10000) * 100, 100);
  const proteinPct = Math.min((avgProtein / 50) * 100, 100);
  const caloriesPct = Math.min((avgCalories / 2000) * 100, 100);
  return Math.round(stepsPct * 0.4) + Math.round(proteinPct * 0.3) + Math.round(caloriesPct * 0.3);
}

/** Averages raw logs falling within [minDaysAgo, maxDaysAgo] of today — used to compare this week vs last week. */
function rangeAverages(logs: HealthLog[], minDaysAgo: number, maxDaysAgo: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inRange = logs.filter((l) => {
    const d = new Date(`${l.logged_at}T00:00:00`);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    return diff >= minDaysAgo && diff <= maxDaysAgo;
  });
  if (inRange.length === 0) return null;
  const avg = (key: "steps" | "protein_g" | "calories") =>
    inRange.reduce((sum, l) => sum + (l[key] ?? 0), 0) / inRange.length;
  return { steps: avg("steps"), protein: avg("protein_g"), calories: avg("calories") };
}

/** Builds a Mon→Sun (last 7 days) series for a single log field, for sparklines. */
function weeklySeries(logs: HealthLog[], key: "steps" | "protein_g" | "calories"): number[] {
  const byDate: Record<string, number> = {};
  for (const l of logs) byDate[l.logged_at] = (byDate[l.logged_at] ?? 0) + (l[key] ?? 0);
  const result: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(byDate[d.toLocaleDateString("en-CA")] ?? 0);
  }
  return result;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 68, h = 20;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricTile({
  icon, label, color, deepColor, chipBg, stripBg, value, unit, goalText, pct, deltaDown, deltaText, sparkline,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  deepColor: string;
  chipBg: string;
  stripBg: string;
  value: React.ReactNode;
  unit?: string;
  goalText: string;
  pct: number;
  deltaDown: boolean;
  deltaText: string;
  sparkline: number[];
}) {
  return (
    <div className="db-card fo-metric-tile" style={{ display: "flex", flexDirection: "column", padding: "13px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: chipBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {icon}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: deepColor }}>{label}</span>
        </div>
        <CaretRight size={13} color="#BFC4CE" />
      </div>

      <div style={{ marginTop: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#1A2744", letterSpacing: "-.5px" }}>{value}</span>
        {unit && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9AA0AD", marginLeft: 3 }}>{unit}</span>}
      </div>
      <p style={{ margin: "1px 0 0", fontSize: 10.5, color: "#9AA0AD", fontWeight: 500 }}>{goalText}</p>

      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7 }}>
        <div className="db-bar-track" style={{ flex: 1, margin: 0, height: 5 }}>
          <div className="db-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color }}>{pct}%</span>
      </div>

      <div style={{
        marginTop: 8, background: stripBg, borderRadius: 10, padding: "6px 10px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
      }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: deepColor }}>
          <TrendUp size={12} weight="bold" style={deltaDown ? { transform: "rotate(180deg)" } : undefined} />
          {deltaText}
        </span>
        <Sparkline data={sparkline} color={color} />
      </div>
    </div>
  );
}

function ScoreRing({ score, tier, size = 46 }: { score: number | null; tier: ScoreTier; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = score ?? 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tier.ringBg} strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tier.ring} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 - 1} textAnchor="middle" fontSize={size * 0.24} fontWeight={800} fill="#1A2744" fontFamily="'Plus Jakarta Sans', sans-serif">
        {score ?? "—"}
      </text>
      <text x={size / 2} y={size / 2 + size * 0.17} textAnchor="middle" fontSize={size * 0.13} fill="#9AA0AD" fontFamily="'Plus Jakarta Sans', sans-serif">
        /100
      </text>
    </svg>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
      <div className="fo-section-bar" style={{ marginTop: 2 }} />
      <div>
        <p style={{ margin: 0, fontSize: 17, fontWeight: 800, letterSpacing: "-.3px", color: "#1A2744", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: "2px 0 0", fontSize: 12.5, fontWeight: 500, color: "#9AA0AD" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

const RANK_PALETTE = [
  { bg: "var(--he-green-bg)", accent: "var(--he-green)", text: "var(--he-green-deep)", caption: "Great job!" },
  { bg: "var(--he-blue-bg)", accent: "var(--he-blue)", text: "var(--he-blue-deep)", caption: "Doing well!" },
  { bg: "var(--he-orange-bg)", accent: "var(--he-orange)", text: "var(--he-orange-deep)", caption: "Keep it up!" },
  { bg: "var(--he-violet-bg)", accent: "#8B7FE8", text: "#6A5BD0", caption: "Room to improve" },
];

type MemberRow = { member: FamilyMember; summary: Summary | null };

export default function FamilyOverviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [memberRows, setMemberRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showAddFamily, setShowAddFamily] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = localStorage.getItem("auth_user");
        const authUser: User | null = stored ? JSON.parse(stored) : null;
        if (!authUser) { window.location.href = "/login"; return; }
        setUser(authUser);
        const token = localStorage.getItem("auth_token") ?? "";

        const [fetchedLogs, fetchedSummary, members] = await Promise.all([
          getUserLogs(authUser.id, 30),
          getUserSummary(authUser.id),
          getFamilyMembers(token).catch(() => [] as FamilyMember[]),
        ]);
        setLogs(fetchedLogs);
        setSummary(fetchedSummary);

        const activeMembers = members.filter((m) => m.status === "active");
        const rows = await Promise.all(
          activeMembers.map(async (member) => ({
            member,
            summary: await getMemberSummary(member.id, token).catch(() => null),
          }))
        );
        setMemberRows(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const weeklySteps = useMemo(() => logsToWeeklySteps(logs), [logs]);
  const streak = useMemo(() => calculateStreak(logs), [logs]);
  const proteinSeries = useMemo(() => weeklySeries(logs, "protein_g"), [logs]);
  const caloriesSeries = useMemo(() => weeklySeries(logs, "calories"), [logs]);
  const stepsSeries = useMemo(() => weeklySteps.map((d) => d.value), [weeklySteps]);
  const hasData = !!summary?.last_logged;
  const proteinAvg = summary?.avg_protein_g ?? 0;
  const caloriesAvg = summary?.avg_calories ?? 0;
  const stepsAvg = summary?.avg_steps ?? 0;
  const proteinPct = Math.min(Math.round((proteinAvg / 50) * 100), 100);
  const caloriesPct = Math.min(Math.round((caloriesAvg / 2000) * 100), 100);
  const stepsAvgPct = Math.min(Math.round((stepsAvg / 10000) * 100), 100);

  const todayIST = new Date().toLocaleDateString("en-CA");
  const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayIST = yesterdayDate.toLocaleDateString("en-CA");
  const todaySteps = logs.find((l) => l.logged_at === todayIST)?.steps ?? 0;
  const yesterdaySteps = logs.find((l) => l.logged_at === yesterdayIST)?.steps ?? 0;
  const stepsTodayPct = Math.min(Math.round((todaySteps / 10000) * 100), 100);
  const stepsVsYesterday = todaySteps - yesterdaySteps;

  const stepsPts = hasData ? Math.round(stepsAvgPct * 0.4) : 0;
  const proteinPts = hasData ? Math.round(proteinPct * 0.3) : 0;
  const caloriesPts = hasData ? Math.round(caloriesPct * 0.3) : 0;
  const personalScore = hasData ? stepsPts + proteinPts + caloriesPts : null;
  const personalTier = scoreTier(personalScore);

  const rankedFamily = useMemo(() => {
    const rows = [
      { id: user?.id ?? 0, name: user?.name ?? "You", score: personalScore, isYou: true },
      ...memberRows.map(({ member, summary: memberSummary }) => ({
        id: member.id,
        name: member.name ?? member.label,
        score: computeScore(memberSummary),
        isYou: false,
      })),
    ];
    return rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  }, [user, personalScore, memberRows]);

  const prevWeekAvgs = useMemo(() => rangeAverages(logs, 7, 13), [logs]);
  const prevWeekScore = prevWeekAvgs ? scoreFromAverages(prevWeekAvgs.steps, prevWeekAvgs.protein, prevWeekAvgs.calories) : null;
  const scoreDelta = personalScore !== null && prevWeekScore !== null ? personalScore - prevWeekScore : null;
  const proteinDeltaPct = prevWeekAvgs && prevWeekAvgs.protein > 0
    ? Math.round(((proteinAvg - prevWeekAvgs.protein) / prevWeekAvgs.protein) * 100)
    : null;
  const caloriesDeltaAbs = prevWeekAvgs ? Math.round(caloriesAvg - prevWeekAvgs.calories) : null;

  const daysLoggedThisWeek = useMemo(() => {
    const last7Dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString("en-CA");
    });
    return last7Dates.filter((date) => logs.some((l) => l.logged_at === date)).length;
  }, [logs]);
  const consistencyMessage = daysLoggedThisWeek === 7
    ? "Amazing consistency! 🎉"
    : daysLoggedThisWeek >= 5
    ? "Great job staying consistent!"
    : daysLoggedThisWeek >= 1
    ? "Keep logging to build your streak."
    : "Start logging today to see your trends.";

  const daysGoalMet = weeklySteps.filter((d) => d.value >= 10000).length;
  const bestDay = weeklySteps.reduce((best, d) => (d.value > best.value ? d : best), weeklySteps[0] ?? { label: "—", value: 0 });
  const weeklyCalorieTotal = Math.round(caloriesAvg * 7);

  const weeklyInsights: { icon: React.ReactNode; text: string }[] = [];
  if (daysGoalMet > 0) {
    weeklyInsights.push({ icon: <TrendUp size={15} weight="bold" color="var(--he-green-deep)" />, text: `Great job! You hit your step goal ${daysGoalMet} of 7 days.` });
  }
  if (proteinDeltaPct !== null && proteinDeltaPct !== 0) {
    weeklyInsights.push({ icon: <FEMeat size={15} />, text: `Protein intake ${proteinDeltaPct > 0 ? "improved" : "dropped"} by ${Math.abs(proteinDeltaPct)}% this week.` });
  }
  if (weeklyCalorieTotal > 0) {
    weeklyInsights.push({ icon: <FEFlame size={15} />, text: `You logged ~${weeklyCalorieTotal.toLocaleString()} kcal this week.` });
  }
  weeklyInsights.push({ icon: <FEDroplet size={15} />, text: "Water & sleep tracking is coming soon." });
  if (weeklyInsights.length === 1) {
    weeklyInsights.unshift({ icon: <Warning size={15} weight="bold" color="var(--he-orange-deep)" />, text: "No health data logged yet this week." });
  }

  const motivCopy = personalTier.label === "All good"
    ? { title: "Keep it up!", message: "You're doing great this week. Stay consistent and crush your goals!" }
    : personalTier.label === "Needs attention"
    ? { title: "Almost there!", message: "A few small tweaks this week could make a big difference." }
    : personalTier.label === "Action required"
    ? { title: "Let's turn it around", message: "Send a quick WhatsApp update today to get back on track." }
    : { title: "Get started!", message: "Send your first WhatsApp update to start tracking your health." };

  if (loading) {
    return (
      <div className="db-page">
        <Sidebar />
        <div className="db-main" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <p style={{ color: "#9AA0AD", fontSize: 14 }}>Loading family overview…</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="db-page">
        <Sidebar />
        <div className="db-main" style={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
          <p style={{ color: "#9AA0AD", fontSize: 14 }}>{error ?? "Something went wrong."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="db-page">
      <Sidebar />
      <div className="db-main">
        <div className="db-topbar">
          <div>
            <h1 className="db-greeting">Family Overview</h1>
            <p className="db-subtitle">A health snapshot for you and everyone you&apos;re tracking.</p>
          </div>
          {memberRows.length > 0 && (
            <div className="db-pill" style={{ cursor: "default" }}>
              <Sparkle size={15} weight="fill" color="#FF6B6B" />
              {memberRows.length} {memberRows.length === 1 ? "member" : "members"} tracked
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <SectionHead title="Everyone you're tracking" subtitle="Tap a card to see their full history" />

            <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
            {memberRows.length === 0 ? (
              <div className="db-card db-card-pad" style={{ flex: "1 1 auto", textAlign: "center", color: "#9AA0AD", fontSize: 13.5 }}>
                No active family members yet. Add one below to see them here.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 300px))", gap: 16, flex: "1 1 auto" }}>
                {memberRows.map(({ member, summary: memberSummary }) => {
                const score = computeScore(memberSummary);
                const tier = scoreTier(score);
                const avatarLetter = (member.name ?? member.label).charAt(0).toUpperCase();
                return (
                  <div
                    key={member.id}
                    className="fo-member-card"
                    style={{
                      background:
                        `linear-gradient(165deg, ${tier.bg} 0%, #fff 55%) padding-box, linear-gradient(135deg, ${tier.border}, ${tier.ring}) border-box`,
                      borderRadius: 24, border: "1.5px solid transparent",
                      boxShadow: "0 4px 16px rgba(26,20,20,.05)", padding: "22px 22px 20px",
                    }}
                  >
                    <div style={{
                      position: "absolute", width: 130, height: 130, borderRadius: "50%",
                      top: -54, right: -42, background: tier.ring, opacity: 0.1,
                      filter: "blur(18px)", pointerEvents: "none",
                    }} />
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, position: "relative" }}>
                      <div style={{ display: "flex", gap: 11 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: "50%",
                          background: `linear-gradient(150deg, ${tier.ring}, ${tier.textColor})`,
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, fontSize: 16, flexShrink: 0,
                          boxShadow: `0 4px 10px ${tier.ring}55`,
                        }}>
                          {avatarLetter}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#1A2744" }}>{member.name ?? member.label}</p>
                          <p style={{ margin: 0, fontSize: 11.5, color: "#9AA0AD" }}>{member.label}</p>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: tier.bg, color: tier.textColor, fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                            {score !== null && (
                              score >= 40
                                ? <CheckCircle size={13} weight="fill" color={tier.ring} />
                                : <Warning size={13} weight="fill" color={tier.ring} />
                            )}
                            {tier.label}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <ScoreRing score={score} tier={tier} size={68} />
                        <span style={{ marginTop: 4, fontSize: 10.5, fontWeight: 700, color: tier.textColor }}>Score</span>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 20, textAlign: "center" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "center" }}><Flame size={20} color="#FF9F45" /></div>
                        <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 800, color: "#1A2744" }}>{memberSummary?.avg_calories != null ? memberSummary.avg_calories.toFixed(0) : "—"}</p>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#7C84A8" }}>Cal</p>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "center" }}><Dumbbell size={20} color="#4F9BF5" /></div>
                        <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 800, color: "#1A2744" }}>{memberSummary?.avg_protein_g != null ? `${memberSummary.avg_protein_g.toFixed(0)}g` : "—"}</p>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#7C84A8" }}>Protein</p>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "center" }}><Footprints size={20} color="#20A865" /></div>
                        <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 800, color: "#1A2744" }}>{memberSummary?.avg_steps != null ? Math.round(memberSummary.avg_steps).toLocaleString() : "—"}</p>
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "#7C84A8" }}>Steps</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMember(member)}
                      style={{
                        width: "100%", marginTop: 18, padding: "10px 0", border: `1.5px solid ${tier.border}`, borderRadius: 14,
                        background: tier.bg, color: tier.textColor, fontSize: 13, fontWeight: 700,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      View Details <CaretRight size={13} weight="bold" />
                    </button>
                  </div>
                );
                })}
              </div>
            )}

            <button
              onClick={() => setShowAddFamily(true)}
              className="fo-add-card"
              style={{
                flex: "0 0 220px", minWidth: 200,
                border: "2px dashed var(--he-coral)", borderRadius: 24,
                background: "linear-gradient(165deg, var(--he-coral-bg) 0%, #fff 75%)",
                boxShadow: "0 8px 22px rgba(232,92,92,.14)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 12, padding: "24px 18px", cursor: "pointer", position: "relative", overflow: "hidden",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <Sparkle size={13} weight="fill" color="var(--he-coral)" style={{ position: "absolute", top: 16, left: 22, opacity: 0.5 }} />
              <Sparkle size={9} weight="fill" color="var(--he-coral)" style={{ position: "absolute", bottom: 22, right: 26, opacity: 0.4 }} />
              <div className="fo-add-pulse-ring">
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", background: "var(--he-coral)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 20px rgba(232,92,92,.4)", position: "relative", zIndex: 1,
                }}>
                  <UserPlus size={26} weight="bold" color="#fff" />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: 14.5, fontWeight: 800, color: "#1A2744" }}>Add a family member</p>
                <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#9AA0AD", fontWeight: 500 }}>Track their health too</p>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5, marginTop: 2,
                background: "var(--he-coral)", color: "#fff", fontSize: 11.5, fontWeight: 700,
                padding: "6px 16px", borderRadius: 99,
              }}>
                Invite now <CaretRight size={12} weight="bold" />
              </span>
            </button>
            </div>
          </div>

          <div style={{ flex: "0 1 420px", minWidth: 360 }}>
            <div className="db-card db-card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, background: "var(--he-orange-bg)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Trophy size={22} weight="fill" color="var(--he-orange)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#1A2744" }}>Family Ranking</p>
                  <p style={{ margin: "1px 0 0", fontSize: 12, color: "#9AA0AD", fontWeight: 500 }}>Based on weekly health score</p>
                </div>
              </div>

              {rankedFamily.map((row, i) => {
                const palette = RANK_PALETTE[i % RANK_PALETTE.length];
                const medal = ["🥇", "🥈", "🥉"][i];
                return (
                  <div
                    key={row.id}
                    style={{
                      display: "flex", flexDirection: "column", gap: 8,
                      background: palette.bg, borderRadius: 14, padding: "12px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        width: i === 0 ? 36 : i === 1 ? 32 : 26, height: i === 0 ? 36 : i === 1 ? 32 : 26,
                        borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: i === 0 ? 24 : i === 1 ? 21 : medal ? 14 : 11, fontWeight: 800,
                        background: medal ? "transparent" : "#fff", color: "#9AA0AD",
                      }}>
                        {medal ?? i + 1}
                      </span>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: palette.accent, color: "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 13,
                      }}>
                        {row.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: 13.5, fontWeight: 800, color: "#1A2744",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {row.name}{row.isYou ? " (You)" : ""}
                        </p>
                        <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: palette.text }}>{palette.caption}</p>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#1A2744", flexShrink: 0 }}>
                        {row.score ?? "—"}<span style={{ fontSize: 11, fontWeight: 600, color: "#9AA0AD" }}>/100</span>
                      </span>
                    </div>
                    <div className="db-bar-track" style={{ margin: 0, height: 5 }}>
                      <div className="db-bar-fill" style={{ width: `${row.score ?? 0}%`, background: palette.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="db-card" style={{ flex: "1.3 1 520px", minWidth: 380, padding: "24px 26px 22px", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 22 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#1A2744", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Your Weekly Score</span>
            <Info size={15} weight="bold" color="#BFC4CE" />
          </div>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              flex: "0 0 200px", paddingRight: 24, borderRight: "1px solid var(--he-hairline)",
            }}>
              <ScoreRing score={personalScore} tier={personalTier} size={140} />
              <span className="db-chip-up" style={{ marginTop: 14, background: personalTier.bg, color: personalTier.textColor }}>
                {personalTier.label}
              </span>
              {scoreDelta !== null && (
                <p style={{
                  margin: "10px 0 0", fontSize: 12.5, fontWeight: 700,
                  color: scoreDelta >= 0 ? "var(--he-green-deep)" : "var(--he-coral-deep)",
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <TrendUp size={13} weight="bold" style={scoreDelta < 0 ? { transform: "rotate(180deg)" } : undefined} />
                  {Math.abs(scoreDelta)} points vs last week
                </p>
              )}
            </div>

            <div style={{ flex: "1 1 280px", minWidth: 240 }}>
              <p style={{ margin: "0 0 14px", fontSize: 13.5, fontWeight: 800, color: "#1A2744" }}>Score Breakdown</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FEShoe size={20} />
                  <span style={{ width: 60, fontSize: 12.5, fontWeight: 700, color: "#2C2F3A" }}>Steps</span>
                  <div className="db-bar-track" style={{ flex: 1, margin: 0 }}><div className="db-bar-fill" style={{ width: `${(stepsPts / 40) * 100}%`, background: "var(--he-green)" }} /></div>
                  <span style={{ width: 44, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#9AA0AD" }}>{stepsPts}/40</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FEMeat size={20} />
                  <span style={{ width: 60, fontSize: 12.5, fontWeight: 700, color: "#2C2F3A" }}>Protein</span>
                  <div className="db-bar-track" style={{ flex: 1, margin: 0 }}><div className="db-bar-fill" style={{ width: `${(proteinPts / 30) * 100}%`, background: "var(--he-coral)" }} /></div>
                  <span style={{ width: 44, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#9AA0AD" }}>{proteinPts}/30</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FEWheat size={20} />
                  <span style={{ width: 60, fontSize: 12.5, fontWeight: 700, color: "#2C2F3A" }}>Calories</span>
                  <div className="db-bar-track" style={{ flex: 1, margin: 0 }}><div className="db-bar-fill" style={{ width: `${(caloriesPts / 30) * 100}%`, background: "#FFB877" }} /></div>
                  <span style={{ width: 44, textAlign: "right", fontSize: 12, fontWeight: 700, color: "#9AA0AD" }}>{caloriesPts}/30</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FEDroplet size={20} />
                  <span style={{ width: 60, fontSize: 12.5, fontWeight: 700, color: "#2C2F3A" }}>Water</span>
                  <div className="db-bar-track" style={{ flex: 1, margin: 0 }}><div className="db-bar-fill" style={{ width: "30%", background: "#D8E4F0" }} /></div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9AA0AD", background: "#F5F3F8", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>Soon</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FEMoon size={20} />
                  <span style={{ width: 60, fontSize: 12.5, fontWeight: 700, color: "#2C2F3A" }}>Sleep</span>
                  <div className="db-bar-track" style={{ flex: 1, margin: 0 }}><div className="db-bar-fill" style={{ width: "30%", background: "#DCD7F2" }} /></div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#9AA0AD", background: "#F5F3F8", padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>Soon</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--he-hairline)", margin: "22px 0" }} />

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 260px" }}>
              <p style={{ margin: "0 0 14px", fontSize: 13.5, fontWeight: 800, color: "#1A2744" }}>7-Day Activity</p>
              <div style={{ display: "flex", gap: 10 }}>
                {weeklySteps.map((d, i) => {
                  const status = d.value === 0 ? "missed" : d.value >= 10000 ? "met" : "partial";
                  const color = status === "met" ? "var(--he-green)" : status === "partial" ? "var(--he-orange)" : "var(--he-coral)";
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9AA0AD" }}>{d.label}</span>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {status === "met" && <CheckCircle size={14} weight="fill" color="#fff" />}
                        {status === "partial" && <Minus size={13} weight="bold" color="#fff" />}
                        {status === "missed" && <X size={12} weight="bold" color="#fff" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 16, fontSize: 11, color: "#9AA0AD", fontWeight: 600, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><CheckCircle size={13} weight="fill" color="var(--he-green)" /> Goal met</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Minus size={13} weight="bold" color="var(--he-orange)" /> Partial</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}><X size={13} weight="bold" color="var(--he-coral)" /> Missed</span>
              </div>
            </div>

            <div style={{ flex: "1 1 280px", minWidth: 240 }}>
              <p style={{ margin: "0 0 14px", fontSize: 13.5, fontWeight: 800, color: "#1A2744" }}>Weekly Insights</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {weeklyInsights.map((ins, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12.5 }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
                    <span style={{ color: "#2C2F3A" }}>{ins.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 22, background: "var(--he-green-bg)", borderRadius: 14, padding: "12px 18px",
            display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
            fontSize: 12.5, fontWeight: 700, color: "var(--he-green-deep)",
          }}>
            <span>🏆 Best day: {bestDay.label}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>👟 Most steps: {bestDay.value.toLocaleString()}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>🔥 Logging streak: {streak} {streak === 1 ? "day" : "days"}</span>
          </div>
        </div>

        <div style={{ flex: "1 1 420px", minWidth: 320, display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
          <MetricTile
            icon={<FEMeat size={16} />} label="Protein"
            color="var(--he-coral)" deepColor="var(--he-coral-deep)" chipBg="var(--he-coral-bg-2)" stripBg="var(--he-coral-bg)"
            value={proteinAvg ? proteinAvg.toFixed(0) : "—"} unit="g" goalText="of 50 g goal" pct={proteinPct}
            deltaDown={proteinDeltaPct !== null && proteinDeltaPct < 0}
            deltaText={proteinDeltaPct !== null ? `${Math.abs(proteinDeltaPct)}% vs last week` : "No data yet"}
            sparkline={proteinSeries}
          />
          <MetricTile
            icon={<FEWheat size={16} />} label="Calories"
            color="var(--he-orange)" deepColor="var(--he-orange-deep)" chipBg="var(--he-orange-bg-2)" stripBg="var(--he-orange-bg)"
            value={caloriesAvg ? caloriesAvg.toFixed(0) : "—"} unit="kcal" goalText="of 2,000 kcal goal" pct={caloriesPct}
            deltaDown={caloriesDeltaAbs !== null && caloriesDeltaAbs < 0}
            deltaText={caloriesDeltaAbs !== null ? `${Math.abs(caloriesDeltaAbs)} kcal vs last week` : "No data yet"}
            sparkline={caloriesSeries}
          />
          <MetricTile
            icon={<FEShoe size={16} />} label="Steps today"
            color="var(--he-green)" deepColor="var(--he-green-deep)" chipBg="var(--he-green-bg-2)" stripBg="var(--he-green-bg)"
            value={todaySteps ? todaySteps.toLocaleString() : "—"} goalText="of 10,000 steps goal" pct={stepsTodayPct}
            deltaDown={stepsVsYesterday < 0}
            deltaText={`${Math.abs(stepsVsYesterday).toLocaleString()} vs yesterday`}
            sparkline={stepsSeries}
          />
          <MetricTile
            icon={<FEMoon size={16} />} label="Sleep"
            color="#8B7FE8" deepColor="#6A5BD0" chipBg="#E4E0FB" stripBg="var(--he-violet-bg)"
            value="6.5" unit="hrs" goalText="of 7–8 hrs goal · Coming soon" pct={81}
            deltaDown={false}
            deltaText="20 mins vs last week"
            sparkline={[5.8, 6.1, 6.4, 5.9, 6.7, 7.0, 6.5]}
          />
          <MetricTile
            icon={<FEDroplet size={16} />} label="Water"
            color="var(--he-blue)" deepColor="var(--he-blue-deep)" chipBg="var(--he-blue-bg-2)" stripBg="var(--he-blue-bg)"
            value="1.8" unit="L" goalText="of 2.5 L goal · Coming soon" pct={72}
            deltaDown={true}
            deltaText="0.2 L vs last week"
            sparkline={[2.1, 1.9, 2.0, 1.7, 1.6, 1.9, 1.8]}
          />
          <div className="db-card" style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", gap: 6, position: "relative", overflow: "hidden", padding: "13px 14px",
            background: "linear-gradient(165deg, var(--he-green-bg) 0%, #fff 65%)",
          }}>
            <Sparkle size={11} weight="fill" color="var(--he-green)" style={{ position: "absolute", top: 14, left: 18, opacity: 0.6 }} />
            <Sparkle size={8} weight="fill" color="var(--he-green)" style={{ position: "absolute", top: 27, left: 30, opacity: 0.4 }} />
            <div style={{
              width: 42, height: 42, borderRadius: "50%", background: "var(--he-green)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 18px rgba(47,190,118,.35)",
            }}>
              <Star size={19} weight="fill" color="#fff" />
            </div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: "var(--he-green-deep)" }}>{motivCopy.title}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#5A5F6E", lineHeight: 1.4, maxWidth: 200 }}>{motivCopy.message}</p>
          </div>
        </div>
        </div>

        <div style={{
          background: "var(--he-blue-bg)", borderRadius: 16, padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <CalendarCheck size={19} weight="bold" color="var(--he-blue-deep)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: "#1A2744" }}>
                You logged {daysLoggedThisWeek} of 7 days this week
              </p>
              <p style={{ margin: "1px 0 0", fontSize: 12, color: "#5A5F6E", fontWeight: 500 }}>{consistencyMessage}</p>
            </div>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700, color: "var(--he-blue-deep)", cursor: "default" }}>
            View detailed analytics <CaretRight size={12} weight="bold" />
          </span>
        </div>
      </div>

      {selectedMember && (
        <FamilyMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {showAddFamily && (
        <AddFamilyModal
          onClose={() => setShowAddFamily(false)}
          onAdded={(member) => setMemberRows((rows) => [...rows, { member, summary: null }])}
        />
      )}
    </div>
  );
}
