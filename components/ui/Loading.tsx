import { Loader2 } from 'lucide-react';
interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
export function Loading({ size = 'md', text }: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} animate-spin text-green-600`} />
      {text && <p className="mt-4 text-gray-500">{text}</p>}
    </div>
  );
}
