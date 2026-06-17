import "server-only"
import { BrevoClient } from "@getbrevo/brevo"

type EmailRecipient = { email: string; name: string }

// ─── Singleton (matches Finora pattern: retries + timeout) ───────────────────

function createBrevoClient() {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY is not set")
  return new BrevoClient({ apiKey, maxRetries: 2, timeoutInSeconds: 30 })
}

const globalForBrevo = globalThis as unknown as { brevo: BrevoClient }
const brevo = globalForBrevo.brevo ?? createBrevoClient()
if (process.env.NODE_ENV !== "production") globalForBrevo.brevo = brevo

function getSender() {
  const email = process.env.BREVO_SENDER_EMAIL
  const name = process.env.BREVO_SENDER_NAME ?? "AduanePa"
  if (!email) throw new Error("BREVO_SENDER_EMAIL is not set")
  return { email, name }
}

function otpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#F4FAF6;margin:0;padding:40px 0;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:700;color:#1A5C38;">AduanePa</span>
    </div>
    <h1 style="font-size:24px;font-weight:700;color:#1c1c1c;margin-bottom:8px;">Verify your email</h1>
    <p style="color:#555;margin-bottom:32px;">Enter this code in AduanePa to verify your email address. It expires in <strong>10 minutes</strong>.</p>
    <div style="background:#F4FAF6;border:2px solid #1A5C38;border-radius:12px;text-align:center;padding:24px 0;letter-spacing:12px;font-size:36px;font-weight:700;color:#1A5C38;">${code}</div>
    <p style="color:#888;font-size:12px;margin-top:32px;">If you didn't create an AduanePa account, you can safely ignore this email.</p>
  </div>
</body>
</html>`
}

/**
 * Sends a branded OTP verification email via Brevo.
 * Subject includes the code so it is visible in inbox previews (Finora pattern).
 */
export async function sendOtpEmail(to: EmailRecipient, code: string): Promise<void> {
  const textContent = [
    "Verify your email address",
    "",
    `Your AduanePa verification code is: ${code}`,
    "",
    "This code expires in 10 minutes.",
    "If you did not request it, you can safely ignore this email.",
  ].join("\n")

  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: getSender(),
    to: [to],
    subject: `${code} is your AduanePa verification code`,
    htmlContent: otpEmailHtml(code),
    textContent,
  })

  if (process.env.NODE_ENV !== "production") {
    console.info("[email] OTP sent to", to.email, "messageId:", result.messageId ?? result)
  }
}
