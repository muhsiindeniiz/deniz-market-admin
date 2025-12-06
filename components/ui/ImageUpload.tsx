// components/ui/ImageUpload.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (files: File[], removedUrls?: string[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    multiple = false,
    maxFiles = 5,
    className,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [removedUrls, setRemovedUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // value değiştiğinde existingImages'ı güncelle
    useEffect(() => {
        if (value) {
            const images = Array.isArray(value) ? value : [value];
            setExistingImages(images.filter((img) => img && !removedUrls.includes(img)));
        } else {
            setExistingImages([]);
        }
    }, [value, removedUrls]);

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            const totalImages = existingImages.length + previews.length + files.length;

            if (totalImages > maxFiles) {
                alert(`En fazla ${maxFiles} resim yükleyebilirsiniz`);
                return;
            }

            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);

            const updatedFiles = [...newFiles, ...files];
            setNewFiles(updatedFiles);
            onChange(updatedFiles, removedUrls);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [existingImages.length, previews.length, maxFiles, newFiles, removedUrls, onChange]
    );

    const removePreview = useCallback(
        (index: number) => {
            setPreviews((prev) => {
                const newPreviews = [...prev];
                URL.revokeObjectURL(newPreviews[index]);
                newPreviews.splice(index, 1);
                return newPreviews;
            });

            const updatedFiles = [...newFiles];
            updatedFiles.splice(index, 1);
            setNewFiles(updatedFiles);
            onChange(updatedFiles, removedUrls);
        },
        [newFiles, removedUrls, onChange]
    );

    const removeExisting = useCallback(
        (url: string) => {
            setExistingImages((prev) => prev.filter((img) => img !== url));
            const updatedRemoved = [...removedUrls, url];
            setRemovedUrls(updatedRemoved);
            onChange(newFiles, updatedRemoved);
        },
        [newFiles, removedUrls, onChange]
    );

    const totalCount = existingImages.length + previews.length;
    const canAddMore = multiple ? totalCount < maxFiles : totalCount === 0;

    return (
        <div className={cn('space-y-4', className)}>
            {canAddMore && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                    <Upload className="w-10 h-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Resim yüklemek için tıklayın veya sürükleyin</p>
                    <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WEBP (max 5MB)
                        {multiple && ` - En fazla ${maxFiles} resim`}
                    </p>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
            />

            {(existingImages.length > 0 || previews.length > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Mevcut resimler */}
                    {existingImages.map((url) => (
                        <div key={url} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={url} alt="Mevcut resim" className="w-full h-full object-cover" />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeExisting(url)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Mevcut
                            </div>
                        </div>
                    ))}

                    {/* Yeni yüklenen resimler */}
                    {previews.map((preview, index) => (
                        <div key={preview} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-green-300">
                                <img
                                    src={preview}
                                    alt={`Önizleme ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removePreview(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                Yeni
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}