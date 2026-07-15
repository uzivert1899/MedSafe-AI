import { T } from "../theme";

export const Pill = ({ label, value }) => (
  <div
    style={{
      background: T.navyLight,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "14px 16px",
    }}
  >
    <div
      style={{
        fontSize: 12,
        color: T.muted,
        marginBottom: 4,
        textTransform: "capitalize",
      }}
    >
      {label.replace(/_/g, " ")}
    </div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: T.white,
        fontFamily: "monospace",
      }}
    >
      {value}
    </div>
  </div>
);
