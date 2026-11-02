import { useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

// index.html sets the initial class before first paint, from the saved choice
// or else the system preference, so this only has to read it back.
export function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      // Storage blocked (private browsing): the choice lasts for this page.
    }
  }

  const label = dark ? "Switch to light theme" : "Switch to dark theme"
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 text-muted-foreground"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}
