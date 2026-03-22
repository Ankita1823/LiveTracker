import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300",
        onClick && "cursor-pointer hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("p-6 border-b border-slate-100", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn("p-6 border-t border-slate-100 bg-slate-50/50", className)}>
      {children}
    </div>
  );
}
