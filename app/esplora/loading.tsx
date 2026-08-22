export default function LoadingExplore() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-12 md:pt-16">
      <div className="skeleton mb-3 h-11 w-44" />
      <div className="skeleton mb-8 h-5 w-[380px] max-w-full" />
      <div className="skeleton mb-4 h-[52px] w-full rounded-2xl" />
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-7 w-28 rounded-full" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex justify-between">
              <div className="skeleton h-5 w-24 rounded-full" />
              <div className="skeleton h-9 w-9 rounded-full" />
            </div>
            <div className="skeleton mt-4 h-6 w-full" />
            <div className="skeleton mt-2 h-6 w-4/5" />
            <div className="skeleton mt-5 h-2 w-full rounded-full" />
            <div className="mt-4 flex gap-3">
              <div className="skeleton h-4 w-16" />
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
