import { MealCardSkeleton } from "@/components/meals/meal-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MealsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <MealCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
