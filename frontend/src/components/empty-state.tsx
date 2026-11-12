/** Estado vacío reutilizable. */
export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
      <span className="text-4xl" aria-hidden>
        📦
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
