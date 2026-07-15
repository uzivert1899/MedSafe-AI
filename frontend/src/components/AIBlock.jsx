import { T } from "../theme";

export const AIBlock = ({
  icon,
  title,
  subtitle,
  color,
  dimColor,
  text,
  maxHeight = 360,
}) => (
  <div
    style={{
      background: T.navyLight,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    }}
  >
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: dimColor,
          border: `1px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.white }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: T.muted }}>{subtitle}</p>
      </div>
    </div>
    <div
      style={{
        fontSize: 13,
        color: T.mutedLight,
        lineHeight: 1.8,
        whiteSpace: "pre-wrap",
        maxHeight,
        overflowY: "auto",
        paddingRight: 6,
      }}
    >
      {text}
    </div>
  </div>
);
