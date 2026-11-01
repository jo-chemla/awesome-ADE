import { Funnel } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HeaderFilterButtonProps extends React.ComponentProps<typeof Button> {
  title: string
  active: boolean
}

// Funnel icon a column header uses to open the same filter popover as the
// toolbar. Spreads its props so it can sit under a PopoverTrigger asChild.
export function HeaderFilterButton({ title, active, className, ...props }: HeaderFilterButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Filter ${title}`}
      title={active ? `Filtering ${title}` : `Filter ${title}`}
      className={cn(
        "size-6 data-[state=open]:bg-accent",
        active ? "text-primary" : "text-muted-foreground/60 hover:text-foreground",
        className,
      )}
      {...props}
    >
      <Funnel className="size-3.5" fill={active ? "currentColor" : "none"} />
    </Button>
  )
}
