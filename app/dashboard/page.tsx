"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  Chart,
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Filler,
  BarController, LineController, DoughnutController,
} from "chart.js";

Chart.register(
  BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Filler,
  BarController, LineController, DoughnutController,
);

const navItems = [
  { icon: "🏠", label: "Home", active: true, href: "#" },
  { icon: "📈", label: "Progress", href: "#" },
  { icon: "📅", label: "Appointments", href: "#" },
  { icon: "👤", label: "Nearby Providers", href: "#" },
  { icon: "📄", label: "Health Records", href: "#" },
  { icon: "⚡", label: "Activity", href: "#" },
  { icon: "🔔", label: "Reminders", href: "#" },
  { icon: "⚙️", label: "Settings", href: "#" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useChart(canvasId: string, buildConfig: () => any) {
  const chartRef = useRef<Chart | null>(null);
  useEffect(() => {
    const el = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!el) return;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(el, buildConfig());
    return () => { chartRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasId]);
}

function StepsChart() {
  useChart("stepsChart", () => ({
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        data: [4200, 5600, 6400, 7100, 9523, 6842, 2900],
        backgroundColor: (ctx: { dataIndex: number }) =>
          ctx.dataIndex === 4 ? "#1A2744" : "#BDDEFF",
        borderRadius: 6,
        borderSkipped: false as const,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: { parsed: { y: number } }) => c.parsed.y.toLocaleString() + " steps" } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "DM Sans", size: 10 }, color: "#9AAABB" } },
        y: { grid: { color: "#F5F0F0" }, ticks: { font: { family: "DM Sans", size: 10 }, color: "#9AAABB", callback: (v: number | string) => Number(v) >= 1000 ? Number(v) / 1000 + "k" : v }, beginAtZero: true },
      },
    },
  }));
  return <canvas id="stepsChart" />;
}

function DonutChart() {
  useChart("donutChart", () => ({
    type: "doughnut",
    data: { datasets: [{ data: [68, 32], backgroundColor: ["#4A8FE2", "#E8F3FF"], borderWidth: 0, hoverOffset: 0 }] },
    options: { cutout: "76%", responsive: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } },
  }));
  return <canvas id="donutChart" width={130} height={130} />;
}

function ProgressChart() {
  useChart("progressChart", () => ({
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        data: [5200, 6200, 7500, 6900, 8400, 9200, 7248],
        borderColor: "#4A8FE2", backgroundColor: "rgba(74,143,226,.09)",
        fill: true, tension: 0.42, borderWidth: 2,
        pointRadius: 3, pointBackgroundColor: "#4A8FE2",
        pointBorderColor: "#fff", pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "DM Sans", size: 9 }, color: "#9AAABB" } },
        y: { display: false },
      },
    },
  }));
  return <canvas id="progressChart" />;
}

function TrendChart() {
  useChart("trendChart", () => ({
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        data: [1, 2, 1, 3, 2, 3, 3],
        borderColor: "#E85C5C", backgroundColor: "rgba(232,92,92,.07)",
        fill: true, tension: 0.42, borderWidth: 2,
        pointRadius: 3, pointBackgroundColor: "#E85C5C",
        pointBorderColor: "#fff", pointBorderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: "DM Sans", size: 9 }, color: "#9AAABB" } },
        y: { display: false, beginAtZero: true },
      },
    },
  }));
  return <canvas id="trendChart" />;
}

export default function DashboardPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: 214, minHeight: "100vh", background: "#fff",
        borderRight: "1px solid #F5EEEE", padding: "24px 14px",
        display: "flex", flexDirection: "column", position: "fixed",
        top: 0, left: 0, bottom: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", marginBottom: 26 }}>
          <div style={{
            width: 32, height: 32, background: "#E85C5C", borderRadius: 9, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 17.2C10 17.2 2.5 12.5 2.5 7.5A5 5 0 0 1 10 3.84 5 5 0 0 1 17.5 7.5C17.5 12.5 10 17.2 10 17.2Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            Health<em style={{ color: "#E85C5C", fontStyle: "normal" }}>Ease</em>
          </span>
        </div>

        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => (
            <li key={item.label}>
              <a href={item.href} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
                borderRadius: 10, fontSize: 13.5, fontWeight: item.active ? 600 : 500,
                color: item.active ? "#E85C5C" : "#6B7A9A",
                background: item.active ? "#FFEDEC" : "transparent",
                textDecoration: "none",
              }}>
                <span>{item.icon}</span> {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "auto", paddingTop: 14 }}>
          <div style={{ background: "linear-gradient(145deg,#FFF5F3,#FFE4DE)", borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>🌱</div>
            <h4 style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.3 }}>Stay consistent,<br />see the change!</h4>
            <p style={{ fontSize: 11.5, color: "#6B7A9A", marginTop: 5, lineHeight: 1.5 }}>Small steps today,<br />a healthier tomorrow.</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 214, padding: "22px 22px 36px", flex: 1 }}>
        {/* Topbar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.2px" }}>Good morning, Priya! 👋</h2>
            <p style={{ fontSize: 13, color: "#6B7A9A", marginTop: 3 }}>Here&apos;s your health overview for today.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, background: "#fff",
              border: "1.5px solid #EDE6E6", borderRadius: 8, padding: "8px 13px",
              fontSize: 12.5, color: "#6B7A9A", fontWeight: 500, cursor: "pointer",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Today, 20 May 2026
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
            <div style={{
              width: 38, height: 38, background: "#fff", border: "1.5px solid #EDE6E6",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div style={{
                position: "absolute", top: 7, right: 8, width: 7, height: 7,
                background: "#E85C5C", borderRadius: "50%", border: "2px solid #fff",
              }} />
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg,#FFD0C8,#FF9E9E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
            }}>P</div>
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13, marginBottom: 14 }}>
          {[
            { ico: "📅", icoColor: "#FFE8E8", lblColor: "#E85C5C", label: "Appointments Today", val: "2", sub: "Today", fillColor: "#E85C5C", pct: 67, goal: "Goal: 3 check-ins", blue: false },
            { ico: "👟", icoColor: "rgba(74,143,226,.15)", lblColor: "#4A8FE2", label: "Steps Today", val: "6,842", sub: "Today", fillColor: "#4A8FE2", pct: 68, goal: "Goal: 10,000 steps", blue: true },
            { ico: "🔥", icoColor: "#FFF0D4", lblColor: "#F5A623", label: "Calories Burned", val: "1,650", sub: "Today", fillColor: "#F5A623", pct: 83, goal: "Goal: 2,000 kcal", blue: false },
          ].map((s) => (
            <div key={s.label} style={{
              background: s.blue ? "linear-gradient(145deg,#EBF3FF,#D4E8FF)" : "#fff",
              borderRadius: 16, padding: "17px 19px",
              boxShadow: "0 2px 12px rgba(26,20,20,.07)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, background: s.icoColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0,
                }}>{s.ico}</div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: s.lblColor }}>{s.label}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.5px", lineHeight: 1.1, marginTop: 3 }}>{s.val}</div>
                  <div style={{ fontSize: 11.5, color: "#6B7A9A", marginTop: 2 }}>{s.sub}</div>
                </div>
              </div>
              <div style={{ marginTop: 13 }}>
                <div style={{ height: 5, background: s.blue ? "rgba(74,143,226,.18)" : "rgba(0,0,0,.08)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, background: s.fillColor, width: `${s.pct}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11 }}>
                  <span style={{ color: "#B0BFCC" }}>{s.goal}</span>
                  <strong style={{ color: "#6B7A9A", fontWeight: 600 }}>{s.pct}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 272px", gap: 13, marginBottom: 13 }}>
          {/* Steps chart */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "17px 19px", boxShadow: "0 2px 12px rgba(26,20,20,.07)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 13 }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Steps Overview</div>
              </div>
              <select style={{ fontSize: 12, border: "1px solid #EDE6E6", borderRadius: 6, padding: "4px 8px", color: "#6B7A9A", background: "#fff", outline: "none", fontFamily: "inherit" }}>
                <option>This Week</option><option>Last Week</option>
              </select>
            </div>
            <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-.4px" }}>6,842</div>
            <div style={{ fontSize: 12, color: "#6B7A9A", marginTop: 2 }}>average steps</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: "#3EB86A", marginTop: 4 }}>↑ 12% vs last week</div>
            <div style={{ position: "relative", marginTop: 10, height: 140 }}>
              <StepsChart />
            </div>
          </div>

          {/* Appointments */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "17px 19px", boxShadow: "0 2px 12px rgba(26,20,20,.07)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 13 }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Appointments Today</div>
                <div style={{ fontSize: 11, color: "#E85C5C", fontWeight: 600, marginTop: 2 }}>2 / 3 confirmed</div>
              </div>
              <a href="#" style={{ fontSize: 12, color: "#E85C5C", fontWeight: 500 }}>View all</a>
            </div>
            <div>
              {[
                { ico: "🩺", name: "Dr. Mehra — General", sp: "City Clinic · 2.1 km away", time: "9:00 AM", badge: "Done", badgeBg: "#E8F8EE", badgeColor: "#3EB86A" },
                { ico: "❤️", name: "Dr. Patel — Cardiology", sp: "Apollo Clinic · 4.8 km away", time: "2:30 PM", badge: "Upcoming", badgeBg: "#FFEDEC", badgeColor: "#E85C5C" },
                { ico: "🧪", name: "Lab Test — Bloodwork", sp: "Diagnostics · 1.3 km away", time: "5:00 PM", badge: "Pending", badgeBg: "#FFF4E0", badgeColor: "#F5A623" },
              ].map((a) => (
                <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #F5EFEF" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: "#FFEDEC",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
                  }}>{a.ico}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "#6B7A9A", marginTop: 1 }}>{a.sp}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#6B7A9A" }}>{a.time}</div>
                    <div style={{
                      display: "inline-block", marginTop: 3, padding: "2px 8px",
                      borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: a.badgeBg, color: a.badgeColor,
                    }}>{a.badge}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginTop: 11,
              padding: "9px 11px", border: "1.5px dashed #EDE6E6", borderRadius: 10,
              fontSize: 12, color: "#6B7A9A", cursor: "pointer",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Book a new appointment
            </div>
          </div>

          {/* Activity donut */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "17px 19px", boxShadow: "0 2px 12px rgba(26,20,20,.07)" }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Activity Summary</div>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", height: 130 }}>
              <DonutChart />
              <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>68%</div>
                <div style={{ fontSize: 10, color: "#6B7A9A", marginTop: 2 }}>of daily goal</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
              {[
                { color: "#4A8FE2", label: "Steps", val: "6,842 / 10,000" },
                { color: "#F5A623", label: "Active Time", val: "45 / 60 mins" },
                { color: "#E85C5C", label: "Calories", val: "1,650 / 2,000" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#6B7A9A" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: row.color }} />
                    {row.label}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 272px", gap: 13 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "17px 19px", boxShadow: "0 2px 12px rgba(26,20,20,.07)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 13 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Your Progress</div>
              <select style={{ fontSize: 12, border: "1px solid #EDE6E6", borderRadius: 6, padding: "4px 8px", color: "#6B7A9A", background: "#fff", outline: "none", fontFamily: "inherit" }}>
                <option>This Week</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.4px" }}>7,248</div>
              <div style={{ fontSize: 12, color: "#6B7A9A" }}>Steps (avg)</div>
            </div>
            <div style={{ position: "relative", height: 90 }}>
              <ProgressChart />
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "17px 19px", boxShadow: "0 2px 12px rgba(26,20,20,.07)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 13 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Appointment Trend</div>
              <select style={{ fontSize: 12, border: "1px solid #EDE6E6", borderRadius: 6, padding: "4px 8px", color: "#6B7A9A", background: "#fff", outline: "none", fontFamily: "inherit" }}>
                <option>This Week</option>
              </select>
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.4px" }}>2.7</div>
              <div style={{ fontSize: 12, color: "#6B7A9A" }}>Avg appointments / week</div>
            </div>
            <div style={{ position: "relative", height: 90 }}>
              <TrendChart />
            </div>
          </div>

          <div style={{
            background: "linear-gradient(145deg,#FFF5F3,#FFE4DE)",
            borderRadius: 16, padding: 17, display: "flex", gap: 14,
            alignItems: "flex-start", boxShadow: "0 2px 12px rgba(26,20,20,.07)",
          }}>
            <div style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>🤗</div>
            <div>
              <h3 style={{ fontSize: 13.5, fontWeight: 700 }}>You&apos;re doing great! 🌸</h3>
              <p style={{ fontSize: 12, color: "#6B7A9A", marginTop: 5, lineHeight: 1.6 }}>
                Consistency is the key to a healthier you. Keep going — every step counts!
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 12, color: "#6B7A9A" }}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
