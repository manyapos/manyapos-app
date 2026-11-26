import { Skeleton } from "@/components/ui/skeleton"

export default function POSLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] animate-in fade-in duration-300">
      <div className="flex-1 space-y-4 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
      <Skeleton className="hidden w-72 md:block" />
    </div>
  )
}
