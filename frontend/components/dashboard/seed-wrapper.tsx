"use client"

import { useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export function SeedWrapper() {
  const seedDemoData = useMutation(api.seed.seedUserData)

  useEffect(() => {
    // Attempt to seed data if this is the user's very first time visiting the dashboard.
    // The mutation is idempotent and won't do anything if they already have an app.
    seedDemoData().catch(console.error)
  }, [seedDemoData])

  return null
}
