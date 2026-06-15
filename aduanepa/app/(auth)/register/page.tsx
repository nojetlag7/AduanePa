import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/auth/register-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Create account · AduanePa",
}

export default function RegisterPage() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start eating well with meals built around you.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-text-secondary">
        Already have an account?&nbsp;
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
