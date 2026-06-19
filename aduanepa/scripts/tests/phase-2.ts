import bcrypt from "bcryptjs"
import type { Tester } from "./harness"
import { fileExists, getTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD } from "./util"

export const meta = { phase: 2, title: "Authentication", implemented: true }

export async function run(t: Tester) {
  t.section("Auth wiring (files)")
  t.check("lib/auth.ts present", fileExists("lib/auth.ts"))
  t.check("edge-safe lib/auth.config.ts present", fileExists("lib/auth.config.ts"))
  t.check("nextauth route present", fileExists("app/api/auth/[...nextauth]/route.ts"))
  t.check("register route present", fileExists("app/api/auth/register/route.ts"))
  t.check("verify-email route present", fileExists("app/api/auth/verify-email/route.ts"))
  t.check("resend-otp route present", fileExists("app/api/auth/resend-otp/route.ts"))
  t.check("OTP service present", fileExists("lib/services/otp.ts"))
  t.check("email service present", fileExists("lib/email.ts"))
  t.check("route protection (proxy.ts) present", fileExists("proxy.ts"))

  t.section("Test user (DB)")
  const user = await getTestUser()
  t.check(`test user exists (${TEST_USER_EMAIL})`, user != null, {
    weight: 3,
    critical: true,
    detail: user ? user.id : "register this user to enable auth-dependent checks",
  })

  if (!user) return

  t.check("test user email is verified", user.emailVerified === true, { weight: 2 })
  t.check("password is hashed (not plaintext)", user.password !== TEST_USER_PASSWORD)

  const matches = user.password
    ? await bcrypt.compare(TEST_USER_PASSWORD, user.password).catch(() => false)
    : false
  t.check("known password verifies against stored hash", matches, {
    weight: 3,
    critical: true,
    detail: matches ? undefined : "Test123! did not match the stored bcrypt hash",
  })
}
