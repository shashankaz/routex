interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({
  icon = "🍽️",
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-stone-700">{title}</h3>
      {description && (
        <p className="text-sm text-stone-400 mt-1 max-w-xs">{description}</p>
      )}
    </div>
  );
}
