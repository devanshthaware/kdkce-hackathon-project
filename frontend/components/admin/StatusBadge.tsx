import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariant = () => {
    if (variant) return variant
    
    const s = status.toLowerCase()
    if (s === "active" || s === "healthy" || s === "safe" || s === "success") return "success"
    if (s === "inactive" || s === "down" || s === "blocked" || s === "critical") return "destructive"
    if (s === "warning" || s === "suspicious" || s === "pending") return "warning"
    
    return "secondary"
  }

  const v = getVariant()

  return (
    <Badge 
      variant={v === "success" || v === "warning" ? "outline" : v as any}
      className={`
        capitalize font-medium
        ${v === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}
        ${v === "warning" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : ""}
      `}
    >
      {status}
    </Badge>
  )
}
