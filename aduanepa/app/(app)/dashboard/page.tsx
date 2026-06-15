import type { Metadata } from "next"
import { UtensilsCrossed } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Dashboard · AduanePa",
}

export default async function DashboardPage() {
  const session = await auth()
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's your nutrition at a glance."
      />
      <EmptyState
        icon={UtensilsCrossed}
        title="No meal plan for today yet"
        description="Generate a personalised, Ghanaian-first meal plan built around your health profile and goals."
        action={
          <Button className="bg-primary text-white hover:bg-primary-hover" disabled>
            Generate today&apos;s plan
          </Button>
        }
      />
    </>
  )
}
