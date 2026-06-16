import type { Metadata } from "next"
import { AuthPanel } from "@/components/auth/auth-panel"

export const metadata: Metadata = {
  title: "Sign in · AduanePa",
}

export default function LoginPage() {
  return <AuthPanel initialMode="signin" />
}
