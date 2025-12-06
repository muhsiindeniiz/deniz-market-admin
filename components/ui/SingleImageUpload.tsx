// components/ui/SingleImageUpload.tsx
'use client';

import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SingleImageUploadProps {
  value?: string | null;
  onChange: (file: File | null) => void;
  aspectRatio?: 'square' | 'wide';
  className?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  aspectRatio = 'square',
  className,
}: SingleImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const aspectClass = aspectRatio === 'wide' ? 'aspect-video' : 'aspect-square';

  return (
    <div className={cn('relative', className)}>
      {value ? (
        <div className={cn('relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200', aspectClass)}>
          <img src={value} alt="Yüklenen resim" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors',
            aspectClass
          )}
        >
          <Upload className="w-8 h-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Resim yükle</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
