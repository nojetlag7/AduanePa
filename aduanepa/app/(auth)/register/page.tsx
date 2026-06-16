import type { Metadata } from "next"
import { AuthPanel } from "@/components/auth/auth-panel"

export const metadata: Metadata = {
  title: "Create account · AduanePa",
}

export default function RegisterPage() {
  return <AuthPanel initialMode="signup" />
}
