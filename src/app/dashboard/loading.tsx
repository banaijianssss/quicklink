export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-64 rounded bg-gray-100" />
      <div className="mt-8 h-40 rounded-xl bg-gray-100" />
      <div className="mt-10 space-y-4">
        <div className="h-24 rounded-xl bg-gray-100" />
        <div className="h-24 rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}
