import Link from "next/link"
import { PRIVACY_POLICY_LAST_UPDATED, PRIVACY_POLICY_VERSION } from "@/lib/legal/privacy-policy"

interface PrivacyPolicyContentProps {
  /** When true, omit the page title block (e.g. inside a dialog). */
  compact?: boolean
}

export function PrivacyPolicyContent({ compact = false }: PrivacyPolicyContentProps) {
  return (
    <article className={compact ? "space-y-5 text-sm" : "prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-text-secondary"}>
      {!compact && (
        <header className="space-y-2 border-b border-border-light pb-6 not-prose">
          <h1 className="font-display text-3xl font-bold text-text-primary">Privacy Policy</h1>
          <p className="text-sm text-text-muted">
            Version {PRIVACY_POLICY_VERSION} · Last updated {PRIVACY_POLICY_LAST_UPDATED}
          </p>
        </header>
      )}

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">1. Introduction</h2>
        <p>
          AduanePa (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is an AI-assisted nutrition and meal-planning
          application designed for users in Ghana. This Privacy Policy explains what personal and health-related
          information we collect, why we collect it, how we use it to provide our services, and the choices you
          have.
        </p>
        <p>
          By creating an account and completing onboarding, you agree to this policy and consent to our use of
          your data as described below so we can personalise meal plans, track your nutrition, and support your
          health goals.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">2. Data we collect</h2>
        <p>We collect only the information needed to run AduanePa:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-text-primary">Account information:</strong> name, email address, and a
            securely hashed password used to authenticate you.
          </li>
          <li>
            <strong className="text-text-primary">Profile information:</strong> date of birth, weight, height,
            health conditions you select (e.g. hypertension, diabetes, obesity), dietary goal, preferred language,
            theme, and measurement preferences.
          </li>
          <li>
            <strong className="text-text-primary">Health logs:</strong> readings you choose to record, such as
            weight, blood sugar, blood pressure, optional notes, and the dates of those entries.
          </li>
          <li>
            <strong className="text-text-primary">Meal and nutrition data:</strong> AI-generated and saved meal
            plans, meal names and descriptions, ingredients, instructions, macro estimates, grocery lists derived
            from your plans, ingredients you enter in &quot;Make Me a Meal&quot;, and whether you completed or
            skipped planned meals.
          </li>
          <li>
            <strong className="text-text-primary">Recommendations:</strong> personalised tips generated from your
            profile, logs, and meal history.
          </li>
          <li>
            <strong className="text-text-primary">Technical data:</strong> session cookies required for sign-in,
            locale preference cookies, and standard server logs (e.g. IP address, browser type) used for security
            and troubleshooting.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">3. How we use your data</h2>
        <p>We use your information solely to provide and improve AduanePa, including to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Calculate calorie and macro targets based on your age, weight, height, and goals.</li>
          <li>Apply dietary safety rules for your declared health conditions when generating meals.</li>
          <li>Generate, save, and display personalised Ghanaian meal plans and recipes.</li>
          <li>Track nutrition trends, adherence, and health readings over time.</li>
          <li>Send email verification codes and essential account-related messages.</li>
          <li>Translate meal names and descriptions into Twi or Ga when you select those languages.</li>
          <li>Protect the service against abuse, fraud, and unauthorised access.</li>
        </ul>
        <p>
          We do <strong className="text-text-primary">not</strong> sell your personal data. We do not use your
          health information for advertising or unrelated profiling.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">4. AI and third-party services</h2>
        <p>
          To deliver personalised meals and recommendations, we send relevant portions of your profile and
          prompts to trusted processors. These providers process data on our behalf and only for the purposes
          described in this policy:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-text-primary">Google Gemini</strong> — generates meal plans, recipes, and
            recommendations. Your name and email are not sent; prompts may include age-derived context, health
            conditions, dietary goals, and ingredients you provide.
          </li>
          <li>
            <strong className="text-text-primary">Ghana NLP / Khaya AI</strong> — translates AI-generated meal
            names and descriptions into Twi or Ga when selected. Only those text fields are sent, not your full
            profile.
          </li>
          <li>
            <strong className="text-text-primary">Brevo</strong> — sends transactional emails such as email
            verification codes to your email address.
          </li>
          <li>
            <strong className="text-text-primary">Hosting and database providers</strong> — store encrypted
            application data and run the service infrastructure.
          </li>
        </ul>
        <p>
          We require that these services maintain appropriate security measures. API keys for AI and email
          services are kept server-side and are never exposed in the app or your browser.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">5. Legal basis and consent</h2>
        <p>
          We process your data based on your consent (given during onboarding and when you update your profile)
          and because processing is necessary to perform our contract with you — providing the nutrition and
          health-tracking features you sign up for.
        </p>
        <p>
          You may withdraw consent for optional features (such as notifications) in Settings. Deleting your
          account withdraws consent for ongoing processing and removes your stored data, subject to brief
          retention of backups as described below.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">6. Storage, security, and retention</h2>
        <p>
          Your data is stored in a PostgreSQL database with access restricted to authorised application
          processes. Passwords are hashed; sessions use secure cookies. We use HTTPS in production and apply
          security headers to reduce common web risks.
        </p>
        <p>
          We retain your data for as long as your account is active. When you delete your account in Settings,
          we remove your user record and associated meal plans, health logs, saved meals, and recommendations.
          Short-lived verification codes expire automatically. Server logs may be retained for a limited period
          for security auditing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">7. Your rights</h2>
        <p>You can:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>View and update your profile, health conditions, and preferences in Settings.</li>
          <li>Export or review your meal and health history within the app while your account is active.</li>
          <li>Change your language or delete individual saved meals and logs through the app.</li>
          <li>
            Delete your entire account and associated data at any time from Settings → Danger zone, which
            requires your password to confirm.
          </li>
          <li>
            Contact us (see Section 10) to request clarification about how your data is used or to raise a
            privacy concern.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">8. Health information disclaimer</h2>
        <p>
          AduanePa provides general nutrition guidance and meal suggestions. It is{" "}
          <strong className="text-text-primary">not</strong> a medical device and does not replace professional
          medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider about managing
          hypertension, diabetes, or other conditions. Do not disregard medical advice because of information in
          this app.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">9. Children</h2>
        <p>
          AduanePa is intended for users aged 10 and older with parental or guardian consent where required by
          local law. We do not knowingly collect data from children under 10. If you believe a child has
          provided us data without appropriate consent, please contact us so we can delete it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-text-primary">10. Contact and changes</h2>
        <p>
          For privacy questions or requests, contact us through the{" "}
          <Link href="/#contact" className="font-medium text-primary hover:underline">
            Contact section
          </Link>{" "}
          on our website or email the address listed there.
        </p>
        <p>
          We may update this policy from time to time. Material changes will be reflected by updating the
          &quot;Last updated&quot; date above. Continued use of AduanePa after changes constitutes acceptance of
          the revised policy where permitted by law.
        </p>
      </section>
    </article>
  )
}
