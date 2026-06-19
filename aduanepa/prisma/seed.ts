import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { FOOD_ITEMS, macroCalorieDrift, toFoodItemCreateInput } from "./food-items-data"

// Seeding is a one-off script — use the direct (non-pooled) connection.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log(`Seeding ${FOOD_ITEMS.length} food items...`)

  const driftWarnings: string[] = []
  for (const item of FOOD_ITEMS) {
    const drift = macroCalorieDrift(item)
    if (drift > 0.15) {
      driftWarnings.push(`${item.name}: ${(drift * 100).toFixed(0)}% macro/kcal drift`)
    }

    const data = toFoodItemCreateInput(item)
    await prisma.foodItem.upsert({
      where: { name: data.name },
      update: data,
      create: data,
    })
  }

  const canonicalNames = FOOD_ITEMS.map((item) => item.name)
  const removed = await prisma.foodItem.deleteMany({
    where: { name: { notIn: canonicalNames } },
  })
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} stale FoodItem record(s).`)
  }

  if (driftWarnings.length > 0) {
    console.warn("Macro/kcal drift >15% (expected for some fiber-rich or composite foods):")
    for (const w of driftWarnings) console.warn(`  - ${w}`)
  }

  const count = await prisma.foodItem.count()
  console.log(`Done. FoodItem table now has ${count} records.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
