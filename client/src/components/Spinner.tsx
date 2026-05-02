export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin ${className}`}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <Spinner className="w-10 h-10" />
    </div>
  );
}
