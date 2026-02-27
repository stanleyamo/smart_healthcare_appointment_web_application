import { cn } from "@/lib/utils";

type StatusVariant = "active" | "inactive" | "pending" | "critical" | "completed" | "scheduled" | "confirmed" | "checked-in" | "in-progress" | "cancelled" | "dispensed";

const variantStyles: Record<StatusVariant, string> = {
  active: "bg-success/15 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/20",
  critical: "bg-destructive/15 text-destructive border-destructive/20",
  completed: "bg-info/15 text-info border-info/20",
  scheduled: "bg-accent/15 text-accent-foreground border-accent/20",
  confirmed: "bg-success/15 text-success border-success/20",
  "checked-in": "bg-info/15 text-info border-info/20",
  "in-progress": "bg-primary/15 text-primary border-primary/20",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
  dispensed: "bg-success/15 text-success border-success/20",
};

export type { StatusVariant };

interface StatusBadgeProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        (variant === "active" || variant === "confirmed" || variant === "dispensed") && "bg-success",
        variant === "inactive" && "bg-muted-foreground",
        (variant === "pending" || variant === "scheduled") && "bg-warning",
        (variant === "critical" || variant === "cancelled") && "bg-destructive",
        (variant === "completed" || variant === "checked-in") && "bg-info",
        variant === "in-progress" && "bg-primary",
      )} />
      {children}
    </span>
  );
}
