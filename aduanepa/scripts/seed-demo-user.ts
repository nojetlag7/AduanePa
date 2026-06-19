/**
 * Seeds a fully-populated demo account with realistic dummy data across every
 * feature built so far: profile, ~2 weeks of AI meal plans (breakfast/lunch/
 * dinner + occasional snack), meal-adherence history, ~3 weeks of health logs,
 * and a small saved-meals library.
 *
 * Idempotent — wipes this user's generated data and re-creates it on each run.
 *
 * Run: npm run seed:demo
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

const DEMO_NAME = process.env.DEMO_USER_NAME ?? "Jeremy Omane-Antwi Boateng"
const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "boatengjoa9@gmail.com"
const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "Test123!"

const MEAL_PLAN_DAYS = 14
const HEALTH_LOG_DAYS = 28

interface Ingredient {
  name: string
  amount: number
  unit: string
}

interface MealTemplate {
  name: string
  description: string
  ingredients: Ingredient[]
  instructions: string[]
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  sodiumMg: number
  prepTimeMin: number
}

const BREAKFASTS: MealTemplate[] = [
  {
    name: "Hausa koko with koose",
    description: "Spiced millet porridge with bean fritters — a classic Ghanaian start to the day.",
    ingredients: [
      { name: "Hausa koko (millet porridge)", amount: 300, unit: "g" },
      { name: "Koose (bean fritter)", amount: 80, unit: "g" },
    ],
    instructions: [
      "Warm the koko gently, stirring so it stays smooth.",
      "Serve hot with freshly fried koose on the side.",
    ],
    calories: 380,
    proteinG: 12,
    carbsG: 60,
    fatG: 9,
    fiberG: 6,
    sodiumMg: 210,
    prepTimeMin: 10,
  },
  {
    name: "Oats with banana",
    description: "Creamy rolled oats topped with ripe banana for steady morning energy.",
    ingredients: [
      { name: "Oats (rolled, dry)", amount: 60, unit: "g" },
      { name: "Banana", amount: 120, unit: "g" },
      { name: "Milk (whole)", amount: 200, unit: "ml" },
    ],
    instructions: [
      "Simmer oats with the milk until thick.",
      "Top with sliced banana and serve.",
    ],
    calories: 420,
    proteinG: 15,
    carbsG: 70,
    fatG: 10,
    fiberG: 7,
    sodiumMg: 90,
    prepTimeMin: 8,
  },
  {
    name: "Bread and eggs",
    description: "Soft bread with boiled eggs — simple, protein-forward and filling.",
    ingredients: [
      { name: "Bread (white)", amount: 80, unit: "g" },
      { name: "Eggs (boiled)", amount: 100, unit: "g" },
    ],
    instructions: ["Boil the eggs to your liking.", "Serve with bread."],
    calories: 360,
    proteinG: 18,
    carbsG: 40,
    fatG: 12,
    fiberG: 2,
    sodiumMg: 320,
    prepTimeMin: 12,
  },
]

const LUNCHES: MealTemplate[] = [
  {
    name: "Waakye with egg and shito",
    description: "Rice and beans cooked with millet leaves, served with pepper sauce and egg.",
    ingredients: [
      { name: "Waakye beans", amount: 200, unit: "g" },
      { name: "White rice (cooked)", amount: 150, unit: "g" },
      { name: "Shito (pepper sauce)", amount: 20, unit: "g" },
      { name: "Eggs (boiled)", amount: 50, unit: "g" },
    ],
    instructions: [
      "Plate the waakye and rice together.",
      "Add boiled egg and a spoon of shito.",
    ],
    calories: 620,
    proteinG: 24,
    carbsG: 95,
    fatG: 14,
    fiberG: 12,
    sodiumMg: 480,
    prepTimeMin: 25,
  },
  {
    name: "Jollof rice with chicken",
    description: "Smoky tomato jollof rice served with grilled skinless chicken.",
    ingredients: [
      { name: "White rice (cooked)", amount: 200, unit: "g" },
      { name: "Tomatoes", amount: 80, unit: "g" },
      { name: "Chicken (skinless, cooked)", amount: 120, unit: "g" },
      { name: "Vegetable oil", amount: 10, unit: "ml" },
    ],
    instructions: [
      "Cook rice in the tomato base until fluffy.",
      "Serve with grilled chicken.",
    ],
    calories: 700,
    proteinG: 38,
    carbsG: 90,
    fatG: 20,
    fiberG: 4,
    sodiumMg: 520,
    prepTimeMin: 35,
  },
  {
    name: "Banku with grilled tilapia",
    description: "Fermented corn and cassava dough with grilled tilapia and pepper.",
    ingredients: [
      { name: "Banku", amount: 250, unit: "g" },
      { name: "Tilapia (grilled)", amount: 150, unit: "g" },
      { name: "Scotch bonnet pepper", amount: 10, unit: "g" },
    ],
    instructions: [
      "Mould the banku into balls.",
      "Serve with grilled tilapia and ground pepper.",
    ],
    calories: 650,
    proteinG: 40,
    carbsG: 80,
    fatG: 16,
    fiberG: 5,
    sodiumMg: 430,
    prepTimeMin: 30,
  },
]

const DINNERS: MealTemplate[] = [
  {
    name: "Fufu with light soup and goat",
    description: "Pounded cassava and plantain in a spicy tomato light soup with goat meat.",
    ingredients: [
      { name: "Fufu (cassava & plantain)", amount: 300, unit: "g" },
      { name: "Goat meat (cooked)", amount: 120, unit: "g" },
      { name: "Tomatoes", amount: 60, unit: "g" },
    ],
    instructions: [
      "Prepare the light soup with tomatoes and spices.",
      "Serve over fufu with goat meat.",
    ],
    calories: 680,
    proteinG: 35,
    carbsG: 100,
    fatG: 15,
    fiberG: 6,
    sodiumMg: 450,
    prepTimeMin: 45,
  },
  {
    name: "Boiled yam with kontomire stew",
    description: "Soft boiled yam with a palm-oil cocoyam-leaf stew and smoked mackerel.",
    ingredients: [
      { name: "Yam (boiled)", amount: 250, unit: "g" },
      { name: "Kontomire (cocoyam leaves)", amount: 120, unit: "g" },
      { name: "Palm oil", amount: 12, unit: "ml" },
      { name: "Mackerel (smoked)", amount: 80, unit: "g" },
    ],
    instructions: [
      "Boil the yam until tender.",
      "Simmer kontomire with palm oil and mackerel; serve together.",
    ],
    calories: 600,
    proteinG: 28,
    carbsG: 85,
    fatG: 18,
    fiberG: 8,
    sodiumMg: 390,
    prepTimeMin: 30,
  },
  {
    name: "Red red (beans and plantain)",
    description: "Black-eyed/red beans stewed in palm oil with sweet fried-style plantain.",
    ingredients: [
      { name: "Plantain (ripe, boiled)", amount: 200, unit: "g" },
      { name: "Beans (red kidney, cooked)", amount: 180, unit: "g" },
      { name: "Palm oil", amount: 12, unit: "ml" },
    ],
    instructions: [
      "Stew the beans in palm oil with onion and pepper.",
      "Serve with plantain.",
    ],
    calories: 560,
    proteinG: 20,
    carbsG: 95,
    fatG: 14,
    fiberG: 14,
    sodiumMg: 300,
    prepTimeMin: 25,
  },
]

const SNACKS: MealTemplate[] = [
  {
    name: "Groundnuts and orange",
    description: "Roasted groundnuts with a fresh orange — a balanced afternoon snack.",
    ingredients: [
      { name: "Groundnuts (roasted)", amount: 40, unit: "g" },
      { name: "Orange", amount: 150, unit: "g" },
    ],
    instructions: ["Enjoy the groundnuts with a peeled orange."],
    calories: 280,
    proteinG: 10,
    carbsG: 25,
    fatG: 16,
    fiberG: 5,
    sodiumMg: 10,
    prepTimeMin: 2,
  },
  {
    name: "Roasted ripe plantain",
    description: "Warm roasted ripe plantain — a light, naturally sweet snack.",
    ingredients: [{ name: "Plantain (ripe, boiled)", amount: 150, unit: "g" }],
    instructions: ["Roast the plantain until caramelised and serve warm."],
    calories: 200,
    proteinG: 2,
    carbsG: 50,
    fatG: 0,
    fiberG: 4,
    sodiumMg: 5,
    prepTimeMin: 15,
  },
]

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function rng(seed: number): number {
  const x = Math.sin(seed * 99991) * 10000
  return x - Math.floor(x)
}

async function main() {
  const bcrypt = (await import("bcryptjs")).default
  const { prisma } = await import("@/lib/db")
  const { DietaryGoal, HealthCondition, LanguagePreference, MealType, LogStatus } =
    await import("@prisma/client")

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

  // ── 1. User ────────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: DEMO_NAME,
      password: passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      dateOfBirth: new Date("1996-03-12"),
      weight: 78,
      height: 179,
      healthConditions: [HealthCondition.HYPERTENSION],
      dietaryGoal: DietaryGoal.WEIGHT_LOSS,
      language: LanguagePreference.ENGLISH,
    },
    create: {
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      dateOfBirth: new Date("1996-03-12"),
      weight: 78,
      height: 179,
      healthConditions: [HealthCondition.HYPERTENSION],
      dietaryGoal: DietaryGoal.WEIGHT_LOSS,
      language: LanguagePreference.ENGLISH,
    },
  })
  const userId = user.id

  // ── 2. Wipe this user's generated data (idempotent) ─────────────────────────
  // Adherence logs cascade when their meals/plans are deleted, but delete
  // explicitly first to be safe across schema variations.
  await prisma.mealAdherenceLog.deleteMany({ where: { userId } })
  await prisma.mealPlan.deleteMany({ where: { userId } }) // cascades to meals
  await prisma.healthLog.deleteMany({ where: { userId } })
  await prisma.savedMeal.deleteMany({ where: { userId } })

  const today = startOfDay(new Date())

  // ── 3. Meal plans + meals + adherence ───────────────────────────────────────
  let mealCount = 0
  let adherenceCount = 0

  for (let i = 0; i < MEAL_PLAN_DAYS; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const breakfast = BREAKFASTS[i % BREAKFASTS.length]
    const lunch = LUNCHES[(i + 1) % LUNCHES.length]
    const dinner = DINNERS[(i + 2) % DINNERS.length]
    const includeSnack = rng(i + 7) > 0.5
    const snack = SNACKS[i % SNACKS.length]

    const entries: { type: keyof typeof MealType; tpl: MealTemplate }[] = [
      { type: "BREAKFAST", tpl: breakfast },
      { type: "LUNCH", tpl: lunch },
      { type: "DINNER", tpl: dinner },
    ]
    if (includeSnack) entries.push({ type: "SNACK", tpl: snack })

    const plan = await prisma.mealPlan.create({
      data: {
        userId,
        date,
        generatedBy: "AI",
        meals: {
          create: entries.map(({ type, tpl }) => ({
            type: MealType[type],
            name: tpl.name,
            description: tpl.description,
            ingredients: tpl.ingredients,
            instructions: tpl.instructions,
            calories: tpl.calories,
            proteinG: tpl.proteinG,
            carbsG: tpl.carbsG,
            fatG: tpl.fatG,
            fiberG: tpl.fiberG,
            sodiumMg: tpl.sodiumMg,
            prepTimeMin: tpl.prepTimeMin,
            isLocalDish: true,
          })),
        },
      },
      include: { meals: true },
    })
    mealCount += plan.meals.length

    // Adherence: today's meals stay PENDING; past days mostly COMPLETED.
    if (i > 0) {
      for (const meal of plan.meals) {
        const roll = rng(i * 10 + meal.type.length)
        const status =
          roll > 0.82 ? LogStatus.SKIPPED : LogStatus.COMPLETED
        await prisma.mealAdherenceLog.create({
          data: { userId, mealId: meal.id, date, status },
        })
        adherenceCount++
      }
    }
  }

  // ── 4. Health logs (sparse, trending toward goal) ───────────────────────────
  let healthCount = 0
  const startWeight = 78.4
  for (let i = HEALTH_LOG_DAYS; i >= 0; i--) {
    // Log roughly every other day (skip ~40% of days for realism).
    if (i !== 0 && rng(i + 3) > 0.6) continue

    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const progress = (HEALTH_LOG_DAYS - i) / HEALTH_LOG_DAYS
    const weight = Math.round((startWeight - progress * 3.1 + (rng(i) - 0.5) * 0.4) * 10) / 10
    const bpSystolic = Math.round(134 - progress * 8 + (rng(i + 1) - 0.5) * 6)
    const bpDiastolic = Math.round(86 - progress * 5 + (rng(i + 2) - 0.5) * 4)
    const bloodSugar = Math.round((5.6 - progress * 0.5 + (rng(i + 4) - 0.5) * 0.5) * 10) / 10

    await prisma.healthLog.create({
      data: {
        userId,
        date,
        weight,
        bpSystolic,
        bpDiastolic,
        bloodSugar,
        notes: i === 0 ? "Feeling good today." : null,
      },
    })
    healthCount++
  }

  // ── 5. Saved meals library ──────────────────────────────────────────────────
  const savedTemplates = [BREAKFASTS[0], LUNCHES[1], DINNERS[1]]
  const savedTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER]
  for (let i = 0; i < savedTemplates.length; i++) {
    const tpl = savedTemplates[i]
    await prisma.savedMeal.create({
      data: {
        userId,
        name: tpl.name,
        mealType: savedTypes[i],
        data: {
          name: tpl.name,
          description: tpl.description,
          type: savedTypes[i],
          ingredients: tpl.ingredients,
          instructions: tpl.instructions,
          calories: tpl.calories,
          proteinG: tpl.proteinG,
          carbsG: tpl.carbsG,
          fatG: tpl.fatG,
          prepTimeMin: tpl.prepTimeMin,
          isLocalDish: true,
        },
      },
    })
  }

  console.log("Demo account seeded:")
  console.log(`  user:        ${DEMO_NAME} <${DEMO_EMAIL}> (id ${userId})`)
  console.log(`  password:    ${DEMO_PASSWORD}`)
  console.log(`  meal plans:  ${MEAL_PLAN_DAYS} days, ${mealCount} meals`)
  console.log(`  adherence:   ${adherenceCount} logs`)
  console.log(`  health logs: ${healthCount}`)
  console.log(`  saved meals: ${savedTemplates.length}`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
