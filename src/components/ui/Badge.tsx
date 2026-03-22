import { cn } from "@/lib/utils";

interface BadgeProps {
  children: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'info' | 'premium';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'border border-slate-200 text-slate-600 bg-transparent',
    premium: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
