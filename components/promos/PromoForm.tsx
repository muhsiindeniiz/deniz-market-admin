// components/promos/PromoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Promo, Category, Product, Store } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface PromoFormProps {
    promo?: Promo | null;
    categories: Category[];
    products: Product[];
    stores: Store[];
    onSubmit: (data: Partial<Promo>, imageFile?: File) => Promise<boolean>;
    onCancel: () => void;
}

export function PromoForm({
    promo,
    categories,
    products,
    stores,
    onSubmit,
    onCancel,
}: PromoFormProps) {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        gradient_start: '#00AA55',
        gradient_end: '#53D62B',
        link_type: 'category' as 'category' | 'product' | 'store' | 'external',
        link_id: '',
        sort_order: 0,
        is_active: true,
        image_url: '',
    });

    useEffect(() => {
        if (promo) {
            setFormData({
                title: promo.title,
                subtitle: promo.subtitle,
                description: promo.description || '',
                gradient_start: promo.gradient_start,
                gradient_end: promo.gradient_end,
                link_type: promo.link_type,
                link_id: promo.link_id || '',
                sort_order: promo.sort_order,
                is_active: promo.is_active,
                image_url: promo.image_url,
            });
        }
    }, [promo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!promo && !imageFile) {
            alert('Lütfen bir görsel yükleyin');
            return;
        }

        setLoading(true);

        const data: Partial<Promo> = {
            title: formData.title,
            subtitle: formData.subtitle,
            description: formData.description || null,
            gradient_start: formData.gradient_start,
            gradient_end: formData.gradient_end,
            link_type: formData.link_type,
            link_id: formData.link_id || null,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
            image_url: formData.image_url,
        };

        const success = await onSubmit(data, imageFile);
        setLoading(false);

        if (success) {
            onCancel();
        }
    };

    const handleImageChange = (files: File[]) => {
        if (files.length > 0) {
            setImageFile(files[0]);
        } else {
            setImageFile(undefined);
        }
    };

    const linkTypeOptions = [
        { value: 'category', label: 'Kategori' },
        { value: 'product', label: 'Ürün' },
        { value: 'store', label: 'Mağaza' },
        { value: 'external', label: 'Harici Link' },
    ];

    const getLinkOptions = () => {
        switch (formData.link_type) {
            case 'category':
                return categories.map((c) => ({ value: c.id, label: c.name }));
            case 'product':
                return products.map((p) => ({ value: p.id, label: p.name }));
            case 'store':
                return stores.map((s) => ({ value: s.id, label: s.name }));
            default:
                return [];
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Başlık"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                />
                <Input
                    label="Alt Başlık"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Rengi</label>
                    <input
                        type="color"
                        value={formData.gradient_start}
                        onChange={(e) => setFormData({ ...formData, gradient_start: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Rengi</label>
                    <input
                        type="color"
                        value={formData.gradient_end}
                        onChange={(e) => setFormData({ ...formData, gradient_end: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                </div>
            </div>

            <div
                className="h-20 rounded-lg"
                style={{
                    background: `linear-gradient(135deg, ${formData.gradient_start}, ${formData.gradient_end})`,
                }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Link Tipi"
                    value={formData.link_type}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            link_type: e.target.value as typeof formData.link_type,
                            link_id: '',
                        })
                    }
                    options={linkTypeOptions}
                />
                {formData.link_type !== 'external' && (
                    <Select
                        label="Link Hedefi"
                        value={formData.link_id}
                        onChange={(e) => setFormData({ ...formData, link_id: e.target.value })}
                        options={getLinkOptions()}
                        placeholder="Seçin"
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Sıralama"
                    type="number"
                    value={formData.sort_order.toString()}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
                <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Aktif</span>
                    </label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kampanya Görseli</label>
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
                    {promo ? 'Güncelle' : 'Kaydet'}
                </Button>
            </div>
        </form>
    );
}