"use client"
export const dynamic = "force-dynamic";

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken } from "@/lib/auth"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const error = searchParams?.get("error")

  useEffect(() => {
    if (token) {
      setToken(token)
      router.replace("/dashboard")
    }
  }, [token, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-lg mb-4">Login failed: {error}</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.replace("/login")}
        >
          Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen text-xl">
      Logging you in...
    </div>
  )
} 