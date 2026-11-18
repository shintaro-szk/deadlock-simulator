/** Placeholder with the size of a demo panel while its code loads. It stops the layout from jumping. */
export function DemoFallback() {
  return (
    <div role="status" aria-label="Loading simulation" className="min-h-[28rem] rounded-lg border border-line bg-surface">
      <div className="h-10 border-b border-line" />
    </div>
  );
}
