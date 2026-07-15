export const RiskCard = ({ text, index }) => (
  <div
    style={{
      background: "rgba(255,77,109,0.12)",
      border: `1px solid rgba(255,77,109,0.3)`,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      animation: `fadeIn 0.4s ease ${index * 0.1}s both`,
    }}
  >
    <span style={{ fontSize: 18, marginTop: 1 }}>⚠️</span>
    <p style={{ margin: 0, fontSize: 13, color: "#FFB3C1", lineHeight: 1.6 }}>
      {text}
    </p>
  </div>
);
