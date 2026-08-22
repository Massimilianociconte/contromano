export default function LoadingRankings() {
  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-10 pt-12 md:pt-16">
      <div className="skeleton mb-3 h-11 w-56" />
      <div className="skeleton mb-8 h-5 w-[420px] max-w-full" />
      <div className="mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-36 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="card mb-6 h-16 w-full" />
      <div className="card overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b px-6 py-5 last:border-b-0">
            <div className="skeleton h-8 w-8" />
            <div className="flex-1">
              <div className="skeleton mb-2 h-4 w-24 rounded-full" />
              <div className="skeleton h-5 w-2/3" />
            </div>
            <div className="skeleton hidden h-12 w-12 rounded-full md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
