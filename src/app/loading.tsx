export default function Loading() {
  return (
    <div
      style={{ padding: "var(--spacing-8)", textAlign: "center" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <p style={{ color: "var(--color-text-subtle-default)" }}>Laden...</p>
    </div>
  );
}
