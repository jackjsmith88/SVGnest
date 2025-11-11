import React from "react";

export default function WelcomeSplash() {
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0b1220 100%)",
      color: "#e5e7eb",
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    },
    card: {
      width: "100%",
      maxWidth: 920,
      borderRadius: 24,
      background: "rgba(15, 23, 42, 0.6)",
      boxShadow:
        "0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.25)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(148, 163, 184, 0.25)",
    },
    inner: {
      padding: "36px 40px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      fontSize: 12,
      letterSpacing: 0.3,
      color: "#93c5fd",
      background: "rgba(59,130,246,0.12)",
      border: "1px solid rgba(59,130,246,0.35)",
      textTransform: "uppercase",
      fontWeight: 600,
    },
    title: {
      marginTop: 18,
      fontSize: 48,
      lineHeight: 1.1,
      fontWeight: 800,
      color: "#f8fafc",
    },
    subtitle: {
      marginTop: 12,
      fontSize: 18,
      color: "#cbd5e1",
      maxWidth: 740,
    },
    list: {
      marginTop: 18,
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 16,
      color: "#cbd5e1",
    },
    listItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "12px 14px",
      borderRadius: 14,
      background: "rgba(148,163,184,0.08)",
      border: "1px solid rgba(148,163,184,0.2)",
    },
    icon: {
      width: 18,
      height: 18,
      marginTop: 2,
      flexShrink: 0,
      opacity: 0.9,
    },
    ctas: {
      marginTop: 26,
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
    },
    primaryBtn: {
      padding: "12px 18px",
      borderRadius: 12,
      border: "1px solid rgba(59,130,246,0.5)",
      background:
        "linear-gradient(180deg, rgba(59,130,246,0.9), rgba(37,99,235,0.9))",
      color: "white",
      fontWeight: 700,
      letterSpacing: 0.2,
      cursor: "pointer",
    },
    ghostBtn: {
      padding: "12px 18px",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,0.35)",
      background: "transparent",
      color: "#e5e7eb",
      fontWeight: 700,
      letterSpacing: 0.2,
      cursor: "pointer",
    },
    footer: {
      marginTop: 28,
      fontSize: 12,
      color: "#94a3b8",
    },
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.inner}>
          <span style={styles.badge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}>
              <path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 15.14l-5-4.87 6.91-1.01L12 3z" />
            </svg>
            SVGNestReact
          </span>

          <h1 style={styles.title}>Welcome to SVGNestReact</h1>
          <p style={styles.subtitle}>
            SVGNestReact is a modern React/Vite adaptation of the open‑source nesting
            idea—bringing SVG part nesting and layout experimentation into a
            familiar front‑end stack. By leveraging React components, hooks, and
            build‑time optimizations from Vite, the project becomes easier to use,
            extend, and integrate with your existing apps.
          </p>

          <div style={styles.list}>
            <div style={styles.listItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              <div>
                <strong>React‑first DX</strong>
                <div>Components and hooks for loading, previewing, and nesting SVG shapes.</div>
              </div>
            </div>
            <div style={styles.listItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}><path d="M3 12l2-2 4 4 8-8 4 4"/></svg>
              <div>
                <strong>Vite‑powered</strong>
                <div>Instant dev server, lightning‑fast HMR, and lean production builds.</div>
              </div>
            </div>
            <div style={styles.listItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}><path d="M12 20l9-5-9-5-9 5 9 5z"/><path d="M12 12l9-5-9-5-9 5 9 5z"/></svg>
              <div>
                <strong>Composable</strong>
                <div>Plug into routers, state managers, and UI kits without friction.</div>
              </div>
            </div>
            <div style={styles.listItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5-5 5 5"/></svg>
              <div>
                <strong>Easy to adopt</strong>
                <div>Drop‑in splash page, then evolve into full features as you go.</div>
              </div>
            </div>
          </div>

          <div style={styles.ctas}>
            <a href="/app">
              <button style={styles.primaryBtn}>Get Started</button>
            </a>
            <a href="https://github.com/" target="_blank" rel="noreferrer">
              <button style={styles.ghostBtn}>View on GitHub</button>
            </a>
          </div>

          <div style={styles.footer}>
            Built with React + Vite. SVG nesting logic is modular, testable, and ready for your pipeline.
          </div>
        </div>
      </section>
    </main>
  );
}
