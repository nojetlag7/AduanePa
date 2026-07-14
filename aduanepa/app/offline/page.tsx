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
        {/* Offline shell — plain img so the page works without the Next image optimizer */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/android-chrome-192x192.png"
          alt=""
          width={64}
          height={64}
          style={{ margin: "0 auto 1rem", display: "block" }}
        />
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
