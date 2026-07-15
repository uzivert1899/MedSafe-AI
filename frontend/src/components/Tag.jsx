import { T } from "../theme";

export const Tag = ({ color, bg, children }) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      padding: "2px 10px",
      borderRadius: 20,
      color,
      background: bg,
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);
