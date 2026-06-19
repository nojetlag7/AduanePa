/**
 * Seeds (or refreshes) the shared test user used by the phase test suite.
 * Idempotent — safe to run repeatedly.
 *
 * Run: npm run test:seed-user
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

async function main() {
  const bcrypt = (await import("bcryptjs")).default
  const { prisma } = await import("@/lib/db")
  const { DietaryGoal, HealthCondition, LanguagePreference } = await import("@prisma/client")

  const email = process.env.TEST_USER_EMAIL ?? "boatengjo9@gmail.com"
  const password = process.env.TEST_USER_PASSWORD ?? "Test123!"
  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      name: "Test User",
      email,
      password: passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      dateOfBirth: new Date("1998-06-15"),
      weight: 72,
      height: 176,
      healthConditions: [HealthCondition.NONE],
      dietaryGoal: DietaryGoal.MAINTENANCE,
      language: LanguagePreference.ENGLISH,
    },
  })

  // Ensure profile is complete even if the row pre-existed without biodata.
  if (user.dateOfBirth == null || user.weight == null || user.height == null) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dateOfBirth: user.dateOfBirth ?? new Date("1998-06-15"),
        weight: user.weight ?? 72,
        height: user.height ?? 176,
      },
    })
  }

  console.log(`Test user ready: ${email} (id ${user.id})`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
