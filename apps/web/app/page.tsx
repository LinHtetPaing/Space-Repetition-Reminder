export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at top left, #e8f1ff, #f7f7f2 55%, #efe8d8)",
        color: "#1a1a1a",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: "36rem", textAlign: "center" }}>
        <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}>
          MVP scaffold
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "0.4rem 0 1rem" }}>
          Spaced Repetition Reminder
        </h1>
        <p style={{ fontSize: "1.125rem", lineHeight: 1.5, margin: 0 }}>
          Create task cards and get an automatic multi-month review calendar.
        </p>
      </div>
    </main>
  );
}
