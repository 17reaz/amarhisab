import { supabase } from "@/lib/supabase"

export type AppTheme = "light" | "dark" | "system"

export const THEME_STORAGE_KEY = "theme"

export function getStoredTheme(): AppTheme {
  const value = localStorage.getItem(THEME_STORAGE_KEY)

  if (value === "light" || value === "dark" || value === "system") {
    return value
  }

  return "system"
}

export function saveTheme(theme: AppTheme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}