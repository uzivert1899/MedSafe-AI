import { useState, useRef, useEffect } from "react";

const API = process.env.REACT_APP_API_URL;

const T = {
  background: "#0D0D0F",
  surface: "#161618",
  surfaceDeep: "#0A0A0B",
  borderDefault: "#2A2A2E",
  borderGlowTeal: "#34D399",
  borderGlowAmber: "#F59E0B",
  borderGlowRed: "#EF4444",
  textPrimary: "#ECECEC",
  textMuted: "#8A8A92",
  textEmphasisTeal: "#6EE7B7",
  textEmphasisAmber: "#FBBF24",
  textEmphasisRed: "#FCA5A5",
};

const glow = (rgb, strength = 1) =>
  `0 0 0 1px rgba(${rgb},${0.18 * strength}), 0 0 ${16 * strength}px rgba(${rgb},${0.1 * strength})`;

const GLOW = {
  teal: glow("52,211,153"),
  amber: glow("245,158,11"),
  red: glow("239,68,68", 1.2),
  none: "none",
};

const isCritical = (text = "") =>
  /critical|high risk|danger|urgent|severe|stop|life[- ]threaten/i.test(text);

// ---------- Icons ----------
const Icon = ({ children, size = 20, color = T.textPrimary }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const ShieldCheckIcon = (p) => (
  <Icon {...p}>
    <path d="M12 2l7 3v5c0 5-3.8 9.7-7 11-3.2-1.3-7-6-7-11V5l7-3z" />
    <path d="M9.5 12.5l2 2 4-4" />
  </Icon>
);
const UploadIcon = (p) => (
  <Icon {...p}>
    <path d="M4 20h16" />
    <path d="M12 16V6" />
    <path d="M8 10l4-4 4 4" />
  </Icon>
);
const AlertIcon = (p) => (
  <Icon {...p}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Icon>
);
const BotIcon = (p) => (
  <Icon {...p}>
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M8 7V5a4 4 0 0 1 8 0v2" />
    <circle cx="9" cy="13" r="1" />
    <circle cx="15" cy="13" r="1" />
  </Icon>
);
const BrainIcon = (p) => (
  <Icon {...p}>
    <path d="M12 19.5a7.5 7.5 0 0 0 0-15" />
    <path d="M12 4.5a7.5 7.5 0 0 1 0 15" />
    <path d="M7.5 5.5a4.5 4.5 0 0 0 0 13" />
    <path d="M16.5 5.5a4.5 4.5 0 0 1 0 13" />
  </Icon>
);
const PillIconSvg = (p) => (
  <Icon {...p}>
    <rect x="3" y="8" width="18" height="8" rx="4" />
    <line x1="12" y1="8" x2="12" y2="16" />
  </Icon>
);
const ChevronIcon = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke={T.textMuted}
    strokeWidth="2"
    style={{
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform .2s",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ---------- Small UI atoms ----------
const Tag = ({ color, bg, children }) => (
  <span
    style={{
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: "0.08em",
      padding: "3px 10px",
      borderRadius: 999,
      color,
      background: bg,
      textTransform: "uppercase",
      fontFamily: "'Space Grotesk',sans-serif",
    }}
  >
    {children}
  </span>
);

const Card = ({ children, glowKey = "none", style = {}, className = "" }) => (
  <div
    className={`glow-${glowKey} ${className}`}
    style={{
      background: T.surface,
      border: `1px solid ${glowKey === "none" ? T.borderDefault : T[`borderGlow${glowKey[0].toUpperCase()}${glowKey.slice(1)}`]}`,
      boxShadow: GLOW[glowKey],
      borderRadius: 18,
      ...style,
    }}
  >
    {children}
  </div>
);

const LabPill = ({ label, value, index = 0, status = "teal" }) => (
  <div
    style={{
      animation: `fadeUp .4s cubic-bezier(.2,.9,.2,1) ${index * 0.04}s both`,
    }}
  >
    <Card
      glowKey={status}
      style={{
        padding: "16px 16px",
        minHeight: 92,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: T.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 500,
        }}
      >
        {label.replace(/_/g, " ")}
      </span>
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "'JetBrains Mono',monospace",
          color:
            status === "amber"
              ? T.textEmphasisAmber
              : status === "red"
                ? T.textEmphasisRed
                : T.textEmphasisTeal,
        }}
      >
        {value}
      </span>
    </Card>
  </div>
);

const RiskCard = ({ text, index }) => {
  const critical = isCritical(text);
  const glowKey = critical ? "red" : "amber";
  const textColor = critical ? T.textEmphasisRed : T.textEmphasisAmber;
  return (
    <Card
      glowKey={glowKey}
      style={{
        padding: 16,
        display: "flex",
        gap: 13,
        alignItems: "flex-start",
        animation: `fadeIn .4s ease ${index * 0.05}s both`,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          background: critical
            ? "rgba(239,68,68,0.12)"
            : "rgba(245,158,11,0.12)",
        }}
      >
        <AlertIcon color={textColor} size={15} />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          lineHeight: 1.6,
          fontFamily: "'Inter',sans-serif",
          fontWeight: 500,
          color: textColor,
        }}
      >
        {text}
      </p>
    </Card>
  );
};

const SectionHeader = ({ title, accent, badge }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div
        style={{ width: 3, height: 16, borderRadius: 999, background: accent }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: T.textMuted,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontFamily: "'Space Grotesk',sans-serif",
        }}
      >
        {title}
      </span>
    </div>
    {badge && (
      <Tag color={accent} bg={`${accent}1A`}>
        {badge}
      </Tag>
    )}
  </div>
);

const MedBadge = ({ name, info }) => (
  <Card
    glowKey="teal"
    className="hover-card"
    style={{ padding: 16, marginBottom: 12 }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        marginBottom: info?.error ? 0 : 10,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 9,
          background: "rgba(52,211,153,0.08)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <PillIconSvg color={T.textEmphasisTeal} size={14} />
      </div>
      <span
        style={{
          fontSize: 13.5,
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600,
          color: T.textPrimary,
          textTransform: "capitalize",
        }}
      >
        {name}
      </span>
      {info?.error && (
        <Tag color={T.textMuted} bg={T.surfaceDeep}>
          Not in FDA DB
        </Tag>
      )}
    </div>
    {!info?.error && info?.indications && (
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 12.5,
          color: T.textMuted,
          lineHeight: 1.65,
          fontFamily: "'Inter',sans-serif",
        }}
      >
        <strong style={{ color: T.textPrimary }}>Use: </strong>
        {info.indications}
      </p>
    )}
    {!info?.error &&
      info?.warnings &&
      info.warnings !== "No warnings available" && (
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: T.textEmphasisAmber,
            lineHeight: 1.65,
            fontFamily: "'Inter',sans-serif",
          }}
        >
          <strong>⚠ </strong>
          {info.warnings}
        </p>
      )}
  </Card>
);

const AIOutputCard = ({
  icon,
  title,
  subtitle,
  glowKey = "teal",
  text,
  defaultOpen = true,
  typewriter = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const isError = text && text.startsWith("Agent error");
  const clean = (text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/###\s*/g, "");
  const [displayed, setDisplayed] = useState(typewriter ? "" : clean);

  useEffect(() => {
    if (!typewriter || clean.length > 2500) {
      setDisplayed(clean);
      return;
    }
    setDisplayed("");
    let i = 0;
    const tid = setInterval(() => {
      i += 4;
      setDisplayed(clean.slice(0, i));
      if (i >= clean.length) clearInterval(tid);
    }, 12);
    return () => clearInterval(tid);
  }, [clean, typewriter]);

  return (
    <Card
      glowKey={glowKey}
      className="hover-card"
      style={{ padding: 18, marginBottom: 14 }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                fontWeight: 600,
                color: T.textPrimary,
                fontFamily: "'Space Grotesk',sans-serif",
              }}
            >
              {title}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: T.textMuted,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {subtitle}
            </p>
          </div>
        </div>
        <ChevronIcon open={open} />
      </div>
      {open && (
        <div
          style={{
            marginTop: 16,
            fontSize: 13,
            lineHeight: 1.75,
            whiteSpace: "pre-wrap",
            maxHeight: 360,
            overflowY: "auto",
            paddingRight: 6,
            color: isError ? T.textEmphasisAmber : "#C9C9CF",
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {isError ? `⏳ ${clean.replace("Agent error: ", "")}` : displayed}
        </div>
      )}
    </Card>
  );
};

const StageStrip = ({ step }) => {
  const stages = [
    ["01", "Intake"],
    ["02", "Analysis"],
    ["03", "Report"],
  ];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {stages.map(([n, label], i) => {
        const stageNum = i + 1;
        const active = step === stageNum;
        const done = step > stageNum;
        return (
          <div
            key={n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 13px",
              borderRadius: 999,
              border: `1px solid ${active || done ? T.borderGlowTeal : T.borderDefault}`,
              boxShadow: active ? GLOW.teal : "none",
              background: active ? "rgba(52,211,153,0.06)" : "transparent",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: active || done ? T.textEmphasisTeal : T.textMuted,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {n}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: active ? T.textPrimary : T.textMuted,
                fontFamily: "'Space Grotesk',sans-serif",
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const PipelineProgress = ({ stage }) => {
  const steps = ["Extract", "Parse", "RAG chain", "Agents", "Orchestrator"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      {steps.map((s, i) => {
        const done = i < stage,
          active = i === stage;
        return (
          <div
            key={s}
            style={{ display: "flex", alignItems: "center", gap: 9 }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: done || active ? T.borderGlowTeal : T.borderDefault,
                boxShadow: active ? GLOW.teal : "none",
              }}
            />
            <span
              style={{
                fontSize: 11.5,
                color: active ? T.textPrimary : T.textMuted,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 18,
                  height: 1,
                  background: done ? T.borderGlowTeal : T.borderDefault,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const AgentTimeline = ({ agentStage }) => {
  const agents = ["Lab Agent", "Medicine Agent", "Orchestrator"];
  return (
    <div style={{ marginTop: 14, display: "grid", gap: 9 }}>
      {agents.map((a, i) => {
        const status =
          agentStage < 0
            ? "pending"
            : agentStage === i
              ? "active"
              : agentStage > i
                ? "done"
                : "pending";
        const color =
          status === "active"
            ? T.borderGlowTeal
            : status === "done"
              ? T.borderGlowAmber
              : T.textMuted;
        return (
          <div
            key={a}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                boxShadow: status === "active" ? GLOW.teal : "none",
              }}
            />
            <span
              style={{
                fontSize: 12.5,
                color: status === "active" ? T.textPrimary : T.textMuted,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              {a}
              {status === "active" && (
                <span style={{ color: T.textMuted }}> · thinking…</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const SkeletonBlock = ({ h = 100 }) => (
  <div
    style={{
      height: h,
      borderRadius: 16,
      background:
        "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 37%, rgba(255,255,255,0.03) 63%)",
      backgroundSize: "400% 100%",
      animation: "shimmer 1.4s ease infinite",
      border: `1px solid ${T.borderDefault}`,
    }}
  />
);

// ============================================================
export default function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [currentMeds, setCurrentMeds] = useState("");
  const [pastMeds, setPastMeds] = useState("");
  const [labResult, setLabResult] = useState(null);
  const [medResult, setMedResult] = useState(null);
  const [loading, setLoading] = useState({ lab: false, med: false });
  const [step, setStep] = useState(1);
  const [deepMode, setDeepMode] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [agentStage, setAgentStage] = useState(-1);
  const fileRef = useRef();

  useEffect(() => {
    let pTimer, aTimer;
    if (loading.lab) {
      setPipelineStage(0);
      setAgentStage(-1);
      pTimer = setInterval(
        () => setPipelineStage((p) => (p < 4 ? p + 1 : p)),
        1100,
      );
      if (deepMode) {
        let a = 0;
        aTimer = setInterval(() => {
          setAgentStage(a);
          if (a < 2) a += 1;
        }, 1700);
      }
    } else if (labResult) {
      setPipelineStage(4);
      setAgentStage(deepMode ? 2 : -1);
    }
    return () => {
      clearInterval(pTimer);
      clearInterval(aTimer);
    };
  }, [loading.lab, deepMode, labResult]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const analyzeReport = async () => {
    if (!file) return;
    setLoading((l) => ({ ...l, lab: true }));
    setStep(2);
    const form = new FormData();
    form.append("file", file);
    try {
      const url = `${API}/upload-report${deepMode ? "?run_agents=true" : ""}`;
      const res = await fetch(url, { method: "POST", body: form });
      setLabResult(await res.json());
    } catch {
      alert(
        "Error connecting to backend. Make sure it's running on port 8000.",
      );
    }
    setLoading((l) => ({ ...l, lab: false }));
  };

  const analyzeMedicines = async () => {
    const current = currentMeds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const past = pastMeds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!current.length) return;
    setLoading((l) => ({ ...l, med: true }));
    try {
      const url = `${API}/analyze-medicines${deepMode ? "?run_agents=true" : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_medicines: current,
          past_medicines: past,
          lab_risks: labResult?.risks || [],
          lab_summary: labResult?.summary?.slice(0, 500) || "",
        }),
      });
      setMedResult(await res.json());
    } catch {
      alert("Error connecting to backend.");
    }
    setLoading((l) => ({ ...l, med: false }));
  };

  const reset = () => {
    setFile(null);
    setLabResult(null);
    setMedResult(null);
    setCurrentMeds("");
    setPastMeds("");
    setStep(1);
  };

  const statusFor = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "teal";
    return "teal"; // backend doesn't send per-value status; risk cards carry the real signal
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.background,
        color: T.textPrimary,
        fontFamily: "'Inter',sans-serif",
        backgroundImage:
          "radial-gradient(circle, #1C1C1F 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 7px; }
        ::-webkit-scrollbar-track { background: ${T.background}; }
        ::-webkit-scrollbar-thumb { background: ${T.borderDefault}; border-radius: 999px; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) scale(.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-card { transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease; }
        .hover-card:hover { transform: translateY(-3px); }
        .glow-teal { transition: box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease; }
        .glow-teal:hover { box-shadow: 0 0 0 1px rgba(52,211,153,0.45), 0 0 28px rgba(52,211,153,0.28) !important; border-color: #34D399 !important; transform: translateY(-2px); }
        .glow-amber { transition: box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease; }
        .glow-amber:hover { box-shadow: 0 0 0 1px rgba(245,158,11,0.45), 0 0 28px rgba(245,158,11,0.28) !important; border-color: #F59E0B !important; transform: translateY(-2px); }
        .glow-red:hover { box-shadow: 0 0 0 1px rgba(239,68,68,0.5), 0 0 30px rgba(239,68,68,0.32) !important; border-color: #EF4444 !important; transform: translateY(-2px); }
        .glow-none:hover { border-color: #3A3A40 !important; box-shadow: 0 0 0 1px rgba(255,255,255,0.06) !important; }
        textarea:focus, input:focus { outline: none; }

        @media print {
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            background: #fff !important; padding: 20px;
          }
          #report-print-area, #report-print-area * {
            background: #fff !important;
            color: #111 !important;
            box-shadow: none !important;
            border-color: #ccc !important;
          }
          .no-print { display: none !important; }
          #report-print-area .glow-red { border-color: #c0392b !important; }
          #report-print-area .glow-amber { border-color: #b8860b !important; }
          #report-print-area .glow-teal { border-color: #1e7a4d !important; }
          #report-print-area h1, #report-print-area h2, #report-print-area p { color: #111 !important; }
        }
      `}</style>

      <header
        style={{
          borderBottom: `1px solid ${T.borderDefault}`,
          padding: "16px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: T.background,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: T.surface,
              border: `1px solid ${T.borderGlowTeal}`,
              display: "grid",
              placeItems: "center",
              boxShadow: GLOW.teal,
            }}
          >
            <ShieldCheckIcon color={T.textEmphasisTeal} size={18} />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              MedSafe<span style={{ color: T.textEmphasisTeal }}>.ai</span>
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: T.textMuted,
                fontFamily: "'Inter',sans-serif",
              }}
            >
              Personalized lab and medication screening
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <StageStrip step={step} />
          {step === 2 && (
            <button
              onClick={reset}
              style={{
                background: "transparent",
                border: `1px solid ${T.borderDefault}`,
                color: T.textMuted,
                padding: "7px 14px",
                borderRadius: 10,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Inter',sans-serif",
              }}
            >
              ← New analysis
            </button>
          )}
        </div>
      </header>

      <main
        style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 32px 60px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 28,
            alignItems: "start",
          }}
        >
          {/* ---------------- Sidebar ---------------- */}
          <aside style={{ position: "sticky", top: 84 }}>
            <Card
              glowKey="teal"
              style={{ padding: 18, display: "grid", gap: 14 }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10.5,
                    letterSpacing: "0.14em",
                    color: T.textMuted,
                    textTransform: "uppercase",
                    fontFamily: "'Space Grotesk',sans-serif",
                  }}
                >
                  Intake
                </p>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 17,
                    fontWeight: 600,
                    fontFamily: "'Space Grotesk',sans-serif",
                  }}
                >
                  Patient data
                </p>
              </div>

              <div
                onClick={() => fileRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `1.5px dashed ${file || dragging ? T.borderGlowTeal : T.borderDefault}`,
                  borderRadius: 14,
                  padding: "16px 12px",
                  background: T.surfaceDeep,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  transition: "border-color .2s",
                  boxShadow: file || dragging ? GLOW.teal : "none",
                }}
              >
                <UploadIcon
                  color={file ? T.textEmphasisTeal : T.textMuted}
                  size={18}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: T.textPrimary,
                    fontFamily: "'Space Grotesk',sans-serif",
                    textAlign: "center",
                  }}
                >
                  {file ? file.name : "Drop or browse file"}
                </p>
                {!file && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: T.textMuted,
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    PDF or TXT lab report
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.txt"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: 10.5,
                    color: T.textMuted,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'Space Grotesk',sans-serif",
                  }}
                >
                  Current medicines
                </label>
                <textarea
                  value={currentMeds}
                  onChange={(e) => setCurrentMeds(e.target.value)}
                  rows={2}
                  placeholder="ibuprofen, metformin..."
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: `1px solid ${T.borderDefault}`,
                    background: T.surfaceDeep,
                    color: T.textPrimary,
                    padding: "9px 11px",
                    resize: "none",
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = T.borderGlowTeal;
                    e.target.style.boxShadow = GLOW.teal;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = T.borderDefault;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: 10.5,
                    color: T.textMuted,
                    display: "block",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'Space Grotesk',sans-serif",
                  }}
                >
                  Past medicines{" "}
                  <span style={{ textTransform: "none", color: "#5A5A60" }}>
                    (3mo)
                  </span>
                </label>
                <textarea
                  value={pastMeds}
                  onChange={(e) => setPastMeds(e.target.value)}
                  rows={2}
                  placeholder="naproxen, amoxicillin..."
                  style={{
                    width: "100%",
                    borderRadius: 10,
                    border: `1px solid ${T.borderDefault}`,
                    background: T.surfaceDeep,
                    color: T.textPrimary,
                    padding: "9px 11px",
                    resize: "none",
                    fontFamily: "'Inter',sans-serif",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = T.borderGlowAmber;
                    e.target.style.boxShadow = GLOW.amber;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = T.borderDefault;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button
                onClick={() => setDeepMode((d) => !d)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  border: `1px solid ${deepMode ? T.borderGlowTeal : T.borderDefault}`,
                  borderRadius: 10,
                  padding: "8px 11px",
                  background: deepMode
                    ? "rgba(52,211,153,0.06)"
                    : "transparent",
                  cursor: "pointer",
                  boxShadow: deepMode ? GLOW.teal : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    color: T.textMuted,
                    fontFamily: "'Inter',sans-serif",
                  }}
                >
                  {deepMode ? "🧠 Deep agent mode" : "⚡ Quick mode"}
                </span>
                <div
                  style={{
                    width: 30,
                    height: 16,
                    borderRadius: 999,
                    background: deepMode ? T.borderGlowTeal : T.borderDefault,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: T.background,
                      position: "absolute",
                      top: 2,
                      left: deepMode ? 16 : 2,
                      transition: "left .2s",
                    }}
                  />
                </div>
              </button>

              <button
                onClick={analyzeReport}
                disabled={!file || loading.lab}
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "none",
                  padding: "12px",
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: 600,
                  fontSize: 13,
                  background: !file ? T.borderDefault : T.borderGlowTeal,
                  color: !file ? T.textMuted : T.background,
                  cursor: !file ? "not-allowed" : "pointer",
                  boxShadow: file && !loading.lab ? GLOW.teal : "none",
                }}
              >
                {loading.lab
                  ? deepMode
                    ? "Agents reasoning…"
                    : "Analyzing…"
                  : "Run analysis →"}
              </button>

              {labResult && (
                <>
                  <div
                    style={{
                      height: 1,
                      background: T.borderDefault,
                      margin: "2px 0",
                    }}
                  />
                  <button
                    onClick={analyzeMedicines}
                    disabled={!currentMeds.trim() || loading.med}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: "none",
                      padding: "12px",
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      background: !currentMeds.trim()
                        ? T.borderDefault
                        : T.borderGlowAmber,
                      color: !currentMeds.trim() ? T.textMuted : T.background,
                      cursor: !currentMeds.trim() ? "not-allowed" : "pointer",
                      boxShadow:
                        currentMeds.trim() && !loading.med
                          ? GLOW.amber
                          : "none",
                    }}
                  >
                    {loading.med ? "Checking…" : "Check interactions →"}
                  </button>
                </>
              )}
            </Card>
          </aside>

          {/* ---------------- Main content ---------------- */}
          <section>
            {step === 1 && (
              <div style={{ display: "grid", gap: 18 }}>
                <Card
                  glowKey="teal"
                  style={{
                    padding: 30,
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "rgba(52,211,153,0.08)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BotIcon color={T.textEmphasisTeal} size={22} />
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 600,
                        fontFamily: "'Space Grotesk',sans-serif",
                      }}
                    >
                      Get started
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 13,
                        color: T.textMuted,
                        fontFamily: "'Inter',sans-serif",
                      }}
                    >
                      Upload your lab report on the left to begin a personalized
                      analysis.
                    </p>
                  </div>
                </Card>

                <div>
                  <SectionHeader
                    title="How it works"
                    accent={T.borderGlowTeal}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 14,
                    }}
                  >
                    <Card glowKey="teal" style={{ padding: 20 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "rgba(52,211,153,0.1)",
                          display: "grid",
                          placeItems: "center",
                          marginBottom: 14,
                        }}
                      >
                        <UploadIcon color={T.textEmphasisTeal} size={17} />
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          color: T.textMuted,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        STEP 01
                      </p>
                      <p
                        style={{
                          margin: "6px 0 8px",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'Space Grotesk',sans-serif",
                        }}
                      >
                        Extract & parse
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          color: T.textMuted,
                          lineHeight: 1.6,
                          fontFamily: "'Inter',sans-serif",
                        }}
                      >
                        PDF/text parsed, lab values extracted and checked
                        against clinical reference ranges.
                      </p>
                    </Card>

                    <Card glowKey="amber" style={{ padding: 20 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "rgba(245,158,11,0.1)",
                          display: "grid",
                          placeItems: "center",
                          marginBottom: 14,
                        }}
                      >
                        <BrainIcon color={T.textEmphasisAmber} size={17} />
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          color: T.textMuted,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        STEP 02
                      </p>
                      <p
                        style={{
                          margin: "6px 0 8px",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'Space Grotesk',sans-serif",
                        }}
                      >
                        RAG + agents
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          color: T.textMuted,
                          lineHeight: 1.6,
                          fontFamily: "'Inter',sans-serif",
                        }}
                      >
                        Retrieves real FDA drug data from a 695-document vector
                        store; agents reason over interactions.
                      </p>
                    </Card>

                    <Card glowKey="red" style={{ padding: 20 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "rgba(239,68,68,0.1)",
                          display: "grid",
                          placeItems: "center",
                          marginBottom: 14,
                        }}
                      >
                        <ShieldCheckIcon color={T.textEmphasisRed} size={17} />
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          color: T.textMuted,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        STEP 03
                      </p>
                      <p
                        style={{
                          margin: "6px 0 8px",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'Space Grotesk',sans-serif",
                        }}
                      >
                        Risk report
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12.5,
                          color: T.textMuted,
                          lineHeight: 1.6,
                          fontFamily: "'Inter',sans-serif",
                        }}
                      >
                        Orchestrator synthesizes everything into a personalized,
                        severity-ranked safety report.
                      </p>
                    </Card>
                  </div>
                </div>

                <div>
                  <SectionHeader
                    title="Under the hood"
                    accent={T.borderGlowTeal}
                  />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      ["695 FDA records indexed", "teal"],
                      ["RAG-grounded retrieval", "teal"],
                      ["3-agent reasoning pipeline", "amber"],
                      ["Groq + LangGraph", "teal"],
                      ["Live drug interaction data", "amber"],
                    ].map(([label, key]) => (
                      <span
                        key={label}
                        style={{
                          fontSize: 12,
                          padding: "8px 14px",
                          borderRadius: 999,
                          fontFamily: "'Inter',sans-serif",
                          color:
                            key === "amber"
                              ? T.textEmphasisAmber
                              : T.textEmphasisTeal,
                          background: T.surface,
                          border: `1px solid ${key === "amber" ? T.borderGlowAmber : T.borderGlowTeal}`,
                          boxShadow: key === "amber" ? GLOW.amber : GLOW.teal,
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && loading.lab && !labResult && (
              <div style={{ display: "grid", gap: 16 }}>
                <Card style={{ padding: 22 }}>
                  <PipelineProgress stage={pipelineStage} />
                  {deepMode && <AgentTimeline agentStage={agentStage} />}
                </Card>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 14,
                  }}
                >
                  <SkeletonBlock h={88} />
                  <SkeletonBlock h={88} />
                  <SkeletonBlock h={88} />
                </div>
                <SkeletonBlock h={140} />
                <SkeletonBlock h={160} />
              </div>
            )}

            {step === 2 && labResult && (
              <div style={{ display: "grid", gap: 22 }}>
                <Card
                  style={{
                    padding: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: T.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'Space Grotesk',sans-serif",
                      }}
                    >
                      Report
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 15,
                        fontWeight: 600,
                        fontFamily: "'Space Grotesk',sans-serif",
                      }}
                    >
                      {labResult.filename}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 700,
                          color: T.textEmphasisTeal,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {Object.keys(labResult.lab_values || {}).length}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          color: T.textMuted,
                        }}
                      >
                        Parameters
                      </p>
                    </div>
                    <div style={{ width: 1, background: T.borderDefault }} />
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono',monospace",
                          color: labResult.risks?.length
                            ? T.textEmphasisRed
                            : T.textEmphasisTeal,
                        }}
                      >
                        {labResult.risks?.length || 0}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 10.5,
                          color: T.textMuted,
                        }}
                      >
                        Risks
                      </p>
                    </div>
                  </div>
                </Card>

                <div>
                  <SectionHeader title="Lab values" accent={T.borderGlowTeal} />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 14,
                    }}
                  >
                    {Object.entries(labResult.lab_values || {}).map(
                      ([k, v], i) => (
                        <LabPill
                          key={k}
                          label={k}
                          value={v}
                          index={i}
                          status={statusFor(v)}
                        />
                      ),
                    )}
                  </div>
                </div>

                {labResult.risks?.length > 0 && (
                  <div>
                    <SectionHeader
                      title="Detected risks"
                      accent={T.borderGlowRed}
                      badge={`${labResult.risks.length}`}
                    />
                    <div style={{ display: "grid", gap: 10 }}>
                      {labResult.risks.map((r, i) => (
                        <RiskCard key={i} text={r} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <SectionHeader
                    title="AI analysis"
                    accent={T.borderGlowTeal}
                  />
                  {labResult.chain_analysis && (
                    <AIOutputCard
                      icon={<BotIcon color={T.textEmphasisTeal} size={16} />}
                      title="Clinical chain analysis"
                      subtitle="RAG-grounded"
                      glowKey="teal"
                      text={labResult.chain_analysis}
                      typewriter
                    />
                  )}
                  {labResult.lab_agent_output && (
                    <AIOutputCard
                      icon={<BrainIcon color={T.textEmphasisTeal} size={16} />}
                      title="Lab analysis agent"
                      subtitle="Autonomous tool-calling"
                      glowKey="teal"
                      text={labResult.lab_agent_output}
                      defaultOpen={false}
                      typewriter
                    />
                  )}
                  {labResult.summary && (
                    <AIOutputCard
                      icon={<BotIcon color={T.textMuted} size={16} />}
                      title="Quick summary"
                      subtitle="Direct LLM output"
                      glowKey="none"
                      text={labResult.summary}
                      defaultOpen={false}
                    />
                  )}
                </div>

                {medResult && (
                  <div>
                    <SectionHeader
                      title="Medicine analysis"
                      accent={T.borderGlowAmber}
                    />
                    {Object.entries(medResult.current_medicines || {}).map(
                      ([n, i]) => (
                        <MedBadge key={n} name={n} info={i} />
                      ),
                    )}
                    {Object.keys(medResult.past_medicines || {}).length > 0 && (
                      <>
                        <p
                          style={{
                            fontSize: 10.5,
                            color: T.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            margin: "12px 0 8px",
                            fontFamily: "'Space Grotesk',sans-serif",
                          }}
                        >
                          Past medicines
                        </p>
                        {Object.entries(medResult.past_medicines).map(
                          ([n, i]) => (
                            <MedBadge key={n} name={n} info={i} />
                          ),
                        )}
                      </>
                    )}
                    {medResult.chain_analysis && (
                      <AIOutputCard
                        icon={<BotIcon color={T.textEmphasisAmber} size={16} />}
                        title="Pharmacist chain analysis"
                        subtitle="Per-medicine severity"
                        glowKey="amber"
                        text={medResult.chain_analysis}
                        typewriter
                      />
                    )}
                    {medResult.medicine_agent_output && (
                      <AIOutputCard
                        icon={
                          <BrainIcon color={T.textEmphasisAmber} size={16} />
                        }
                        title="Medicine safety agent"
                        subtitle="Autonomous interaction check"
                        glowKey="amber"
                        text={medResult.medicine_agent_output}
                        defaultOpen={false}
                        typewriter
                      />
                    )}
                    {medResult.orchestrator_output && (
                      <AIOutputCard
                        icon={
                          <ShieldCheckIcon
                            color={T.textEmphasisRed}
                            size={16}
                          />
                        }
                        title="Risk orchestrator"
                        subtitle="Final synthesized verdict"
                        glowKey="red"
                        text={medResult.orchestrator_output}
                        typewriter
                      />
                    )}
                  </div>
                )}

                {medResult && (
                  <div style={{ textAlign: "center", marginTop: 4 }}>
                    <button
                      onClick={() => setStep(3)}
                      style={{
                        background: T.borderGlowTeal,
                        color: T.background,
                        border: "none",
                        borderRadius: 12,
                        padding: "14px 36px",
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk',sans-serif",
                        cursor: "pointer",
                        boxShadow: GLOW.teal,
                      }}
                    >
                      Generate final report →
                    </button>
                  </div>
                )}

                <Card glowKey="teal" style={{ padding: 18 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textEmphasisTeal,
                      fontFamily: "'Space Grotesk',sans-serif",
                    }}
                  >
                    🩺 Show this to your doctor
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12.5,
                      color: T.textMuted,
                      lineHeight: 1.7,
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    This analysis is AI-generated and not a substitute for
                    professional medical advice.
                  </p>
                </Card>
              </div>
            )}

            {step === 3 && labResult && (
              <div id="report-print-area" style={{ display: "grid", gap: 22 }}>
                <Card
                  glowKey="teal"
                  style={{
                    padding: 26,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 14, alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 13,
                        background: "rgba(52,211,153,0.1)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <ShieldCheckIcon color={T.textEmphasisTeal} size={22} />
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: "'Space Grotesk',sans-serif",
                        }}
                      >
                        Final health report
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12.5,
                          color: T.textMuted,
                          fontFamily: "'Inter',sans-serif",
                        }}
                      >
                        Generated {new Date().toLocaleDateString()} ·{" "}
                        {labResult.filename}
                      </p>
                    </div>
                  </div>
                  <button
                    className="no-print"
                    onClick={() => window.print()}
                    style={{
                      background: "transparent",
                      border: `1px solid ${T.borderGlowTeal}`,
                      color: T.textEmphasisTeal,
                      borderRadius: 10,
                      padding: "10px 18px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Space Grotesk',sans-serif",
                      boxShadow: GLOW.teal,
                    }}
                  >
                    ⬇ Export / Print
                  </button>
                </Card>

                <div>
                  <SectionHeader
                    title="At a glance"
                    accent={T.borderGlowTeal}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 14,
                    }}
                  >
                    <Card
                      glowKey="teal"
                      style={{ padding: 18, textAlign: "center" }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 26,
                          fontWeight: 700,
                          color: T.textEmphasisTeal,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {Object.keys(labResult.lab_values || {}).length}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 11,
                          color: T.textMuted,
                        }}
                      >
                        Parameters checked
                      </p>
                    </Card>
                    <Card
                      glowKey={labResult.risks?.length ? "red" : "teal"}
                      style={{ padding: 18, textAlign: "center" }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 26,
                          fontWeight: 700,
                          color: labResult.risks?.length
                            ? T.textEmphasisRed
                            : T.textEmphasisTeal,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {labResult.risks?.length || 0}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 11,
                          color: T.textMuted,
                        }}
                      >
                        Risks flagged
                      </p>
                    </Card>
                    <Card
                      glowKey="amber"
                      style={{ padding: 18, textAlign: "center" }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 26,
                          fontWeight: 700,
                          color: T.textEmphasisAmber,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {medResult
                          ? Object.keys(medResult.current_medicines || {})
                              .length
                          : 0}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 11,
                          color: T.textMuted,
                        }}
                      >
                        Medicines reviewed
                      </p>
                    </Card>
                    <Card
                      glowKey="teal"
                      style={{ padding: 18, textAlign: "center" }}
                    >
                      <p
                        style={{
                          margin: 0,
                          fontSize: 26,
                          fontWeight: 700,
                          color: T.textEmphasisTeal,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {deepMode ? "Deep" : "Quick"}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 11,
                          color: T.textMuted,
                        }}
                      >
                        Analysis mode
                      </p>
                    </Card>
                  </div>
                </div>

                {labResult.risks?.length > 0 && (
                  <div>
                    <SectionHeader
                      title="Critical findings"
                      accent={T.borderGlowRed}
                      badge={`${labResult.risks.length}`}
                    />
                    <div style={{ display: "grid", gap: 10 }}>
                      {labResult.risks.map((r, i) => (
                        <RiskCard key={i} text={r} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {medResult?.orchestrator_output && (
                  <div>
                    <SectionHeader
                      title="Final verdict"
                      accent={T.borderGlowRed}
                    />
                    <AIOutputCard
                      icon={
                        <ShieldCheckIcon color={T.textEmphasisRed} size={16} />
                      }
                      title="Risk orchestrator summary"
                      subtitle="Synthesized across lab + medicine analysis"
                      glowKey="red"
                      text={medResult.orchestrator_output}
                      typewriter={false}
                    />
                  </div>
                )}

                {!medResult?.orchestrator_output &&
                  labResult.chain_analysis && (
                    <div>
                      <SectionHeader
                        title="Clinical summary"
                        accent={T.borderGlowTeal}
                      />
                      <AIOutputCard
                        icon={<BotIcon color={T.textEmphasisTeal} size={16} />}
                        title="Chain analysis"
                        subtitle="RAG-grounded"
                        glowKey="teal"
                        text={labResult.chain_analysis}
                        typewriter={false}
                      />
                    </div>
                  )}

                <Card glowKey="teal" style={{ padding: 20 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: T.textEmphasisTeal,
                      fontFamily: "'Space Grotesk',sans-serif",
                    }}
                  >
                    🩺 Bring this report to your next doctor's visit
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12.5,
                      color: T.textMuted,
                      lineHeight: 1.7,
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    This report is AI-generated for informational purposes and
                    does not replace professional medical advice, diagnosis, or
                    treatment.
                  </p>
                </Card>

                <div className="no-print" style={{ textAlign: "center" }}>
                  <button
                    onClick={reset}
                    style={{
                      background: "transparent",
                      border: `1px solid ${T.borderDefault}`,
                      color: T.textMuted,
                      borderRadius: 10,
                      padding: "10px 24px",
                      fontSize: 12.5,
                      cursor: "pointer",
                      fontFamily: "'Inter',sans-serif",
                    }}
                  >
                    ← Start a new analysis
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
