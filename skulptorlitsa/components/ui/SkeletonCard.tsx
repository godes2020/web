export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-[--radius-lg] overflow-hidden shadow-[--shadow-card]">
      <div className="skeleton aspect-video w-full" />
      <div className="p-6 space-y-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-10 w-32 rounded-[--radius-md] mt-4" />
      </div>
    </div>
  );
}
