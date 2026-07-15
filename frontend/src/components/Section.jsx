import { T } from "../theme";

export const Section = ({ title, accent, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
      }}
    >
      <div
        style={{
          width: 3,
          height: 18,
          borderRadius: 2,
          background: accent || T.teal,
        }}
      />
      <h3
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 600,
          color: T.mutedLight,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>
    </div>
    {children}
  </div>
);
