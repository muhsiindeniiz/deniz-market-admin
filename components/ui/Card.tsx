import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
