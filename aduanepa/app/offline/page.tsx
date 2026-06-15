export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F4FAF6",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1A5C38"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto 1rem" }}
          aria-hidden="true"
        >
          <path d="M1 6l4 4 4-4M1 10l4-4 4 4" />
          <line x1="12" y1="12" x2="12" y2="12.01" />
          <path d="M20.2 6a3 3 0 0 0-5.4-1.6" />
          <path d="M2 10h.01" />
          <path d="M7 10h.01" />
          <path d="M12 10h.01" />
          <path d="M17 10h.01" />
          <path d="M22 10h.01" />
          <path d="M5 14H4a2 2 0 0 0 0 4h16a2 2 0 0 0 0-4h-1" />
        </svg>
        <h1
          style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1c1c1c", margin: "0 0 0.5rem" }}
        >
          You&apos;re offline
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#9e9e9e", margin: 0 }}>
          Check your connection and try again. Your last meal plan is still available.
        </p>
      </div>
    </div>
  )
}
