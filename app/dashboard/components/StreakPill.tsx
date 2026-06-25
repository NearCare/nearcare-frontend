"use client";

export default function StreakPill({ streak }: { streak: number }) {
  return (
    <div className="db-pill" style={{
      background: streak > 0 ? "#FFF3E8" : "#F5F3F8",
      border: `1.5px solid ${streak > 0 ? "#FFD0A0" : "#EDE6E6"}`,
      color: streak > 0 ? "#CC6A00" : "#9AA0AD",
      fontWeight: 800,
      gap: 5,
      cursor: "default",
    }}>
      🔥 {streak} {streak === 1 ? "day" : "days"}
    </div>
  );
}
