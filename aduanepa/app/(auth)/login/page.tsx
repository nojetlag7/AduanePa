import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Sign in · AduanePa",
}

export default function LoginPage() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your meal plans.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-text-secondary">
        New to AduanePa?&nbsp;
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </CardFooter>
    </Card>
  )
}
