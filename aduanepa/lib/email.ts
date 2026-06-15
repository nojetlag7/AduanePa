import "server-only"
import { BrevoClient } from "@getbrevo/brevo"

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? ""
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "AduanePa"

let client: BrevoClient | null = null

function getClient(): BrevoClient {
  if (!client) {
    const apiKey = process.env.BREVO_API_KEY
    if (!apiKey) throw new Error("BREVO_API_KEY is not configured")
    client = new BrevoClient({ apiKey })
  }
  return client
}

function otpEmailHtml(code: string): string {
  return `
  <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1c1c1c;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 22px; font-weight: 700; color: #1A5C38;">AduanePa</span>
    </div>
    <h1 style="font-size: 18px; font-weight: 600; margin: 0 0 12px;">Verify your email address</h1>
    <p style="font-size: 14px; line-height: 1.5; color: #555555; margin: 0 0 24px;">
      Enter the 6-digit code below to finish setting up your account.
    </p>
    <div style="text-align: center; margin: 0 0 24px;">
      <span style="display: inline-block; font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #1A5C38; background: #F4FAF6; border-radius: 12px; padding: 16px 24px;">
        ${code}
      </span>
    </div>
    <p style="font-size: 13px; line-height: 1.5; color: #9e9e9e; margin: 0;">
      This code expires in 10 minutes. If you did not request it, you can safely ignore this email.
    </p>
  </div>`
}

/**
 * Sends a branded OTP verification email via Brevo.
 * Errors are caught and surfaced as a thrown Error so the caller can return a
 * clear message — they never crash the registration flow silently.
 */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  try {
    await getClient().transactionalEmails.sendTransacEmail({
      subject: "Your AduanePa verification code",
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      htmlContent: otpEmailHtml(code),
    })
  } catch (error) {
    console.error("[email] Failed to send OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}
