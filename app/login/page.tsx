"use client";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", padding: 20, gap: 20, alignItems: "stretch" }}>
      {/* Left hero */}
      <div style={{
        flex: 1.25,
        background: "linear-gradient(145deg,#FFF5F3 0%,#FFE8E4 55%,#FFD8D0 100%)",
        borderRadius: 20, padding: "36px 40px 0",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: -70, right: -70, width: 220, height: 220,
          background: "rgba(232,92,92,.07)", borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: 120, left: -50, width: 160, height: 160,
          background: "rgba(232,92,92,.05)", borderRadius: "50%",
        }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative", zIndex: 1 }}>
          <div style={{
            width: 38, height: 38, background: "#E85C5C", borderRadius: 11,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 17.2C10 17.2 2.5 12.5 2.5 7.5A5 5 0 0 1 10 3.84 5 5 0 0 1 17.5 7.5C17.5 12.5 10 17.2 10 17.2Z" fill="white" />
              <circle cx="10" cy="7.5" r="1.8" fill="#E85C5C" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.3px" }}>
            Health<em style={{ color: "#E85C5C", fontStyle: "normal" }}>Ease</em>
          </span>
        </div>

        {/* Copy */}
        <div style={{ marginTop: 52, position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px" }}>
            Welcome to<br />
            <em style={{ color: "#E85C5C", fontStyle: "normal" }}>HealthEase</em>
          </h1>
          <p style={{ marginTop: 14, fontSize: 14, color: "#6B7A9A", lineHeight: 1.7, maxWidth: 340 }}>
            Track appointments, monitor your health journey, and find nearby providers — your complete health companion. ❤️
          </p>
        </div>

        {/* Art */}
        <div style={{
          marginTop: 36, flex: 1, minHeight: 220, borderRadius: "16px 16px 0 0",
          background: "repeating-linear-gradient(-50deg,#FFCFC9 0,#FFCFC9 1px,transparent 1px,transparent 16px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.35 }}>
            <circle cx="32" cy="24" r="12" stroke="#E85C5C" strokeWidth="2" />
            <circle cx="20" cy="30" r="8" stroke="#E85C5C" strokeWidth="2" />
            <circle cx="44" cy="30" r="8" stroke="#E85C5C" strokeWidth="2" />
            <path d="M8 52c0-8 10-12 24-12s24 4 24 12" stroke="#E85C5C" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: "#BBA0A0", textAlign: "center", lineHeight: 1.6 }}>
            family / community<br />health illustration
          </span>
        </div>
      </div>

      {/* Right form */}
      <div style={{
        flex: 1, background: "#fff", borderRadius: 20, padding: "52px 44px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        boxShadow: "0 6px 28px rgba(26,20,20,.10)",
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.3px" }}>Log in to your account</h2>
        <p style={{ marginTop: 6, fontSize: 14, color: "#6B7A9A" }}>Glad to see you! Please enter your details.</p>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Email */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              display: "flex", color: "#B0BFCC",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Email or Phone number"
              style={{
                width: "100%", padding: "13px 14px 13px 44px",
                border: "1.5px solid #EDE6E6", borderRadius: 8,
                fontSize: 14, fontFamily: "inherit", color: "#1A2744",
                background: "#FAFAFA", outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = "#E85C5C"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#EDE6E6"; e.target.style.background = "#FAFAFA"; }}
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
              display: "flex", color: "#B0BFCC",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={{
                width: "100%", padding: "13px 44px 13px 44px",
                border: "1.5px solid #EDE6E6", borderRadius: 8,
                fontSize: 14, fontFamily: "inherit", color: "#1A2744",
                background: "#FAFAFA", outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = "#E85C5C"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#EDE6E6"; e.target.style.background = "#FAFAFA"; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                display: "flex", color: "#B0BFCC", background: "none", border: "none", cursor: "pointer",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6B7A9A", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" style={{ accentColor: "#E85C5C" }} /> Remember me
          </label>
          <a href="#" style={{ fontSize: 13, color: "#E85C5C", fontWeight: 600 }}>Forgot Password?</a>
        </div>

        <Link href="/dashboard" style={{
          marginTop: 20, width: "100%", padding: 14, background: "#E85C5C", color: "#fff",
          border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600,
          fontFamily: "inherit", cursor: "pointer", textAlign: "center", display: "block",
        }}>Log In</Link>

        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          margin: "20px 0", fontSize: 13, color: "#B0BFCC",
        }}>
          <div style={{ flex: 1, height: 1, background: "#EDE6E6" }} />
          or continue with
          <div style={{ flex: 1, height: 1, background: "#EDE6E6" }} />
        </div>

        <button style={{
          width: "100%", padding: 13, border: "1.5px solid #EDE6E6", borderRadius: 8,
          background: "#fff", fontSize: 14, fontWeight: 500, fontFamily: "inherit",
          color: "#1A2744", cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.943 17.64 9.2z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p style={{ marginTop: 22, textAlign: "center", fontSize: 13, color: "#6B7A9A" }}>
          Don&apos;t have an account?{" "}
          <a href="#" style={{ color: "#E85C5C", fontWeight: 600 }}>Sign Up</a>
        </p>
        <p style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
          <Link href="/" style={{ color: "#6B7A9A", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
