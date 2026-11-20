import Link from "next/link";
import { button, buttonSecondary, linkRow, pageShell, subtitle, title } from "./styles";

export default function HomePage() {
  return (
    <main style={pageShell}>
      <div style={{ maxWidth: "36rem", textAlign: "center", display: "grid", gap: "1rem" }}>
        <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7, margin: 0 }}>
          MVP scaffold
        </p>
        <h1 style={{ ...title, fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
          Spaced Repetition Reminder
        </h1>
        <p style={{ ...subtitle, fontSize: "1.125rem" }}>
          Create task cards and get an automatic multi-month review calendar.
        </p>
        <div style={linkRow}>
          <Link href="/register" style={{ ...button, textDecoration: "none" }}>
            Register
          </Link>
          <Link href="/login" style={{ ...buttonSecondary, textDecoration: "none" }}>
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
