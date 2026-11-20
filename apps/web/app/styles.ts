import type { CSSProperties } from "react";

export const pageShell: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background:
    "radial-gradient(circle at top left, #e8f1ff, #f7f7f2 55%, #efe8d8)",
  color: "#1a1a1a",
  padding: "2rem",
};

export const panel: CSSProperties = {
  width: "100%",
  maxWidth: "24rem",
  display: "grid",
  gap: "1rem",
};

/** Wider shell for task-card list and editor pages. */
export const widePanel: CSSProperties = {
  ...panel,
  maxWidth: "40rem",
};

export const title: CSSProperties = {
  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
  margin: 0,
};

export const subtitle: CSSProperties = {
  margin: 0,
  opacity: 0.75,
  lineHeight: 1.45,
};

export const label: CSSProperties = {
  display: "grid",
  gap: "0.35rem",
  fontSize: "0.95rem",
};

export const input: CSSProperties = {
  font: "inherit",
  padding: "0.65rem 0.75rem",
  border: "1px solid #c8c4b8",
  borderRadius: "0.35rem",
  background: "#fff",
};

export const button: CSSProperties = {
  font: "inherit",
  padding: "0.7rem 1rem",
  border: "1px solid #1a1a1a",
  borderRadius: "0.35rem",
  background: "#1a1a1a",
  color: "#f7f7f2",
  cursor: "pointer",
};

export const buttonSecondary: CSSProperties = {
  ...button,
  background: "transparent",
  color: "#1a1a1a",
};

export const errorText: CSSProperties = {
  margin: 0,
  color: "#8b1e1e",
  fontSize: "0.95rem",
};

export const linkRow: CSSProperties = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  flexWrap: "wrap",
};
