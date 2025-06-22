import Cookies from "js-cookie"
import { BACKEND_BASE_URL } from "@/lib/config"

const TOKEN_KEY = "cs_jwt_token"

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "lax" })
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getToken(): string | undefined {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem(TOKEN_KEY)
    if (local) return local
  }
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function refreshToken(): Promise<string | undefined> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // send cookies
    })
    if (res.ok) {
      const data = await res.json()
      if (data.token) {
        setToken(data.token)
        return data.token
      }
    }
  } catch (err) {
    // Optionally handle error
  }
  return undefined
} 