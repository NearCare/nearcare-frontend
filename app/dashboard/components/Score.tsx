import type { Summary } from "@/lib/api";

export type ScoreTier = {
  label: string;
  textColor: string;
  bg: string;
  ring: string;
  ringBg: string;
  border: string;
};

export function scoreTier(score: number | null): ScoreTier {
  if (score === null) return { label: "No data yet", textColor: "#9AA0AD", bg: "#F5F3F8", ring: "#D8D4DC", ringBg: "#F5F3F8", border: "#E8E4EA" };
  if (score >= 70) return { label: "All good", textColor: "#20A865", bg: "#EAFBF0", ring: "#20A865", ringBg: "#EAFBF0", border: "#BFE8D2" };
  if (score >= 40) return { label: "Needs attention", textColor: "#C9700F", bg: "#FFF4E8", ring: "#FF9F45", ringBg: "#FFF4E8", border: "#FFD9A0" };
  return { label: "Action required", textColor: "#E85C5C", bg: "#FFF1F0", ring: "#FF6B6B", ringBg: "#FFF1F0", border: "#FFCBC4" };
}

export function computeScore(summary: Summary | null): number | null {
  if (!summary || !summary.last_logged) return null;
  const stepsPct = Math.min(((summary.avg_steps ?? 0) / 10000) * 100, 100);
  const proteinPct = Math.min(((summary.avg_protein_g ?? 0) / 50) * 100, 100);
  const caloriesPct = Math.min(((summary.avg_calories ?? 0) / 2000) * 100, 100);
  return Math.round(stepsPct * 0.4 + proteinPct * 0.3 + caloriesPct * 0.3);
}

export function scoreFromAverages(avgSteps: number, avgProtein: number, avgCalories: number): number {
  const stepsPct = Math.min((avgSteps / 10000) * 100, 100);
  const proteinPct = Math.min((avgProtein / 50) * 100, 100);
  const caloriesPct = Math.min((avgCalories / 2000) * 100, 100);
  return Math.round(stepsPct * 0.4) + Math.round(proteinPct * 0.3) + Math.round(caloriesPct * 0.3);
}

function scoreGradientId(score: number | null, size: number) {
  return `score-gradient-${score ?? "empty"}-${size}`;
}

function scoreGradientStops(tier: ScoreTier) {
  if (tier.label === "All good") return { from: "#19A85F", to: "#57D68D" };
  if (tier.label === "Needs attention") return { from: "#F47B20", to: "#FFC15F" };
  if (tier.label === "Action required") return { from: "#E8415E", to: "#FF8A7A" };
  return { from: "#9AA0AD", to: "#C5CAD3" };
}

export function ScoreText({ score, tier, size = "md" }: { score: number | null; tier: ScoreTier; size?: "sm" | "md" | "lg" }) {
  const scale = size === "lg"
    ? { numerator: 34, slash: 38, denominator: 25, gap: 6 }
    : size === "sm"
    ? { numerator: 16, slash: 18, denominator: 13, gap: 3 }
    : { numerator: 25, slash: 29, denominator: 20, gap: 5 };
  const gradient = scoreGradientStops(tier);

  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: scale.gap, whiteSpace: "nowrap" }}>
      <span
        style={{
          fontSize: scale.numerator,
          fontWeight: 900,
          lineHeight: 1,
          color: tier.ring,
          background: score === null ? "none" : `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
          WebkitBackgroundClip: score === null ? undefined : "text",
          WebkitTextFillColor: score === null ? undefined : "transparent",
        }}
      >
        {score ?? "—"}
      </span>
      <span style={{ fontSize: scale.slash, fontWeight: 500, lineHeight: 0.9, color: "#A7ADBA" }}>/</span>
      <span style={{ fontSize: scale.denominator, fontWeight: 700, lineHeight: 1, color: "#9AA0AD" }}>100</span>
    </span>
  );
}

export function ScoreRing({ score, tier, size = 46 }: { score: number | null; tier: ScoreTier; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = score ?? 0;
  const gradientId = scoreGradientId(score, size);
  const isLarge = size >= 100;
  const gradient = scoreGradientStops(tier);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradient.from} />
          <stop offset="100%" stopColor={gradient.to} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tier.ringBg} strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tier.ring} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={isLarge ? size * 0.54 : size * 0.48}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isLarge ? size * 0.34 : size * 0.26}
        fontWeight={900}
        fill={score === null ? "#9AA0AD" : `url(#${gradientId})`}
        fontFamily="'Plus Jakarta Sans', sans-serif"
      >
        {score ?? "—"}
      </text>
    </svg>
  );
}
