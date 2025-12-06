// components/categories/CategoryForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface CategoryFormProps {
    category?: Category | null;
    onSubmit: (data: Partial<Category>, imageFile?: File, removeImage?: boolean) => Promise<boolean>;
    onCancel: () => void;
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [removeImage, setRemoveImage] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        icon: '🛒',
        color: '#00AA55',
        image_url: null as string | null,
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                icon: category.icon,
                color: category.color,
                image_url: category.image_url,
            });
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const success = await onSubmit(formData, imageFile, removeImage);
        setLoading(false);

        if (success) {
            onCancel();
        }
    };

    const handleImageChange = (files: File[], removedUrls?: string[]) => {
        if (files.length > 0) {
            setImageFile(files[0]);
            setRemoveImage(false);
        } else if (removedUrls && removedUrls.length > 0) {
            setRemoveImage(true);
            setImageFile(undefined);
            setFormData((prev) => ({ ...prev, image_url: null }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Kategori Adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
            />

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="İkon (Emoji)"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Renk</label>
                    <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Görseli</label>
                <ImageUpload
                    value={formData.image_url || undefined}
                    onChange={handleImageChange}
                    multiple={false}
                />
            </div>

            <div className="flex items-center justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    İptal
                </Button>
                <Button type="submit" loading={loading}>
                    {category ? 'Güncelle' : 'Kaydet'}
                </Button>
            </div>
        </form>
    );
}