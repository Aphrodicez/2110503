import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  label?: string;
  className?: string;
}

export const Spinner = ({ label, className }: SpinnerProps) => (
  <div className={cn("flex items-center gap-3 text-muted-foreground", className)}>
    <Loader2 className="h-5 w-5 animate-spin" />
    {label && <span className="text-sm font-medium">{label}</span>}
  </div>
);
