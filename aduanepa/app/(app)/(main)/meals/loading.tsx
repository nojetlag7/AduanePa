import { MealCardSkeleton } from "@/components/meals/meal-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MealsLoading() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <MealCardSkeleton key={i} />
      ))}
      <Skeleton className="col-span-full h-10 max-w-md" />
    </div>
  )
}
