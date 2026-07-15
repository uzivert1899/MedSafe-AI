import { T } from "../theme";
import { Tag } from "./Tag";

export const MedBadge = ({ name, info }) => (
  <div
    style={{
      background: T.navyLight,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 10,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: info?.error ? 0 : 10,
      }}
    >
      <span style={{ fontSize: 16 }}>💊</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: T.white,
          textTransform: "capitalize",
        }}
      >
        {name}
      </span>
      {info?.error && (
        <Tag color={T.muted} bg={T.border}>
          Not in FDA DB
        </Tag>
      )}
    </div>
    {!info?.error && info?.indications && (
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 12,
          color: T.mutedLight,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: T.muted }}>Use: </strong>
        {info.indications}
      </p>
    )}
    {!info?.error && info?.warnings && (
      <p style={{ margin: 0, fontSize: 12, color: "#FFD0A0", lineHeight: 1.6 }}>
        <strong style={{ color: T.amber }}>⚠ </strong>
        {info.warnings}
      </p>
    )}
  </div>
);
