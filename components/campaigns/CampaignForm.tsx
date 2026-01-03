'use client';

import { useState, useEffect } from 'react';
import { Campaign, Category, Product, CampaignType, DiscountType } from '@/lib/types';
import { CampaignFormData } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CAMPAIGN_TYPE_LABELS, DISCOUNT_TYPE_LABELS, DAY_LABELS } from '@/lib/constants';
import { X, Check } from 'lucide-react';

interface CampaignFormProps {
    campaign?: Campaign | null;
    categories: Category[];
    products: Product[];
    onSubmit: (data: CampaignFormData, imageFile?: File) => Promise<boolean>;
    onCancel: () => void;
    loading: boolean;
}

const CAMPAIGN_TYPES: { value: CampaignType; label: string }[] = [
    { value: 'flash_sale', label: CAMPAIGN_TYPE_LABELS.flash_sale },
    { value: 'weekend', label: CAMPAIGN_TYPE_LABELS.weekend },
    { value: 'min_cart', label: CAMPAIGN_TYPE_LABELS.min_cart },
    { value: 'brand', label: CAMPAIGN_TYPE_LABELS.brand },
    { value: 'birthday', label: CAMPAIGN_TYPE_LABELS.birthday },
    { value: 'category', label: CAMPAIGN_TYPE_LABELS.category },
    { value: 'product', label: CAMPAIGN_TYPE_LABELS.product },
    { value: 'first_order', label: CAMPAIGN_TYPE_LABELS.first_order },
    { value: 'free_delivery', label: CAMPAIGN_TYPE_LABELS.free_delivery },
];

const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
    { value: 'percentage', label: DISCOUNT_TYPE_LABELS.percentage },
    { value: 'fixed', label: DISCOUNT_TYPE_LABELS.fixed },
    { value: 'free_delivery', label: DISCOUNT_TYPE_LABELS.free_delivery },
];

const DAYS = [
    { value: 0, label: DAY_LABELS[0] },
    { value: 1, label: DAY_LABELS[1] },
    { value: 2, label: DAY_LABELS[2] },
    { value: 3, label: DAY_LABELS[3] },
    { value: 4, label: DAY_LABELS[4] },
    { value: 5, label: DAY_LABELS[5] },
    { value: 6, label: DAY_LABELS[6] },
];

const DEFAULT_COLORS = {
    badge: '#FF6B6B',
    background: '#FFF5F5',
};

export function CampaignForm({
    campaign,
    categories,
    products,
    onSubmit,
    onCancel,
    loading,
}: CampaignFormProps) {
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [formData, setFormData] = useState<CampaignFormData>({
        name: '',
        description: null,
        campaign_type: 'flash_sale',
        discount_type: 'percentage',
        discount_value: 0,
        max_discount: null,
        min_order_amount: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: null,
        end_time: null,
        valid_days: [],
        brand_name: null,
        badge_text: null,
        badge_color: DEFAULT_COLORS.badge,
        background_color: DEFAULT_COLORS.background,
        max_uses: null,
        max_uses_per_user: 1,
        sort_order: 0,
        is_active: true,
        is_featured: false,
        selected_product_ids: [],
        selected_category_ids: [],
    });

    useEffect(() => {
        if (campaign) {
            setFormData({
                name: campaign.name,
                description: campaign.description,
                campaign_type: campaign.campaign_type,
                discount_type: campaign.discount_type,
                discount_value: campaign.discount_value,
                max_discount: campaign.max_discount,
                min_order_amount: campaign.min_order_amount,
                start_date: campaign.start_date.split('T')[0],
                end_date: campaign.end_date.split('T')[0],
                start_time: campaign.start_time,
                end_time: campaign.end_time,
                valid_days: campaign.valid_days || [],
                brand_name: campaign.brand_name,
                badge_text: campaign.badge_text,
                badge_color: campaign.badge_color,
                background_color: campaign.background_color,
                max_uses: campaign.max_uses,
                max_uses_per_user: campaign.max_uses_per_user,
                sort_order: campaign.sort_order,
                is_active: campaign.is_active,
                is_featured: campaign.is_featured,
                selected_product_ids: campaign.campaign_products?.map((cp) => cp.product_id) || [],
                selected_category_ids: campaign.campaign_categories?.map((cc) => cc.category_id) || [],
            });
        }
    }, [campaign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData, imageFile);
    };

    const handleImageChange = (files: File[]) => {
        setImageFile(files[0]);
    };

    const toggleDay = (day: number) => {
        setFormData((prev) => ({
            ...prev,
            valid_days: prev.valid_days.includes(day)
                ? prev.valid_days.filter((d) => d !== day)
                : [...prev.valid_days, day].sort(),
        }));
    };

    const toggleProduct = (productId: string) => {
        setFormData((prev) => ({
            ...prev,
            selected_product_ids: prev.selected_product_ids?.includes(productId)
                ? prev.selected_product_ids.filter((id) => id !== productId)
                : [...(prev.selected_product_ids || []), productId],
        }));
    };

    const toggleCategory = (categoryId: string) => {
        setFormData((prev) => ({
            ...prev,
            selected_category_ids: prev.selected_category_ids?.includes(categoryId)
                ? prev.selected_category_ids.filter((id) => id !== categoryId)
                : [...(prev.selected_category_ids || []), categoryId],
        }));
    };

    const showTimeFields = formData.campaign_type === 'flash_sale';
    const showDayFields = formData.campaign_type === 'weekend';
    const showBrandField = formData.campaign_type === 'brand';
    const showProductSelector = formData.campaign_type === 'product';
    const showCategorySelector = formData.campaign_type === 'category';
    const showDiscountFields = formData.discount_type !== 'free_delivery';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h3>

                <Input
                    label="Kampanya Adı *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Flash İndirim!"
                    required
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                        placeholder="Kampanya açıklaması..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Kampanya Türü *"
                        value={formData.campaign_type}
                        onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value as CampaignType })}
                        options={CAMPAIGN_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    />
                    <Select
                        label="İndirim Tipi *"
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as DiscountType })}
                        options={DISCOUNT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    />
                </div>
            </div>

            {/* Discount Settings */}
            {showDiscountFields && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">İndirim Ayarları</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={formData.discount_type === 'percentage' ? 'İndirim Oranı (%) *' : 'İndirim Tutarı (₺) *'}
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.discount_value}
                            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                            required
                        />
                        {formData.discount_type === 'percentage' && (
                            <Input
                                label="Maksimum İndirim (₺)"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.max_discount || ''}
                                onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : null })}
                                placeholder="Sınırsız"
                            />
                        )}
                    </div>

                    <Input
                        label="Minimum Sepet Tutarı (₺)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.min_order_amount}
                        onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                    />
                </div>
            )}

            {/* Free Delivery Min Order */}
            {formData.discount_type === 'free_delivery' && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Ücretsiz Kargo Koşulları</h3>
                    <Input
                        label="Minimum Sepet Tutarı (₺)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.min_order_amount}
                        onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                    />
                </div>
            )}

            {/* Date & Time */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Tarih ve Zaman</h3>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Başlangıç Tarihi *"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                    />
                    <Input
                        label="Bitiş Tarihi *"
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        required
                    />
                </div>

                {/* Flash Sale Time Fields */}
                {showTimeFields && (
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Başlangıç Saati"
                            type="time"
                            value={formData.start_time || ''}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value || null })}
                        />
                        <Input
                            label="Bitiş Saati"
                            type="time"
                            value={formData.end_time || ''}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value || null })}
                        />
                    </div>
                )}

                {/* Weekend Days */}
                {showDayFields && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Geçerli Günler</label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => toggleDay(day.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        formData.valid_days.includes(day.value)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Brand Field */}
            {showBrandField && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Marka Bilgileri</h3>
                    <Input
                        label="Marka Adı *"
                        value={formData.brand_name || ''}
                        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value || null })}
                        placeholder="Ülker"
                        required={showBrandField}
                    />
                </div>
            )}

            {/* Product Selector */}
            {showProductSelector && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Ürün Seçimi</h3>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                        {products.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => toggleProduct(product.id)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                    formData.selected_product_ids?.includes(product.id)
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <span className="truncate">{product.name}</span>
                                {formData.selected_product_ids?.includes(product.id) && (
                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">
                        {formData.selected_product_ids?.length || 0} ürün seçildi
                    </p>
                </div>
            )}

            {/* Category Selector */}
            {showCategorySelector && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Kategori Seçimi</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => toggleCategory(category.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    formData.selected_category_ids?.includes(category.id)
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">
                        {formData.selected_category_ids?.length || 0} kategori seçildi
                    </p>
                </div>
            )}

            {/* Usage Limits */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Kullanım Limitleri</h3>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Toplam Kullanım Limiti"
                        type="number"
                        min="0"
                        value={formData.max_uses || ''}
                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                        placeholder="Sınırsız"
                    />
                    <Input
                        label="Kullanıcı Başına Limit"
                        type="number"
                        min="1"
                        value={formData.max_uses_per_user}
                        onChange={(e) => setFormData({ ...formData, max_uses_per_user: parseInt(e.target.value) || 1 })}
                    />
                </div>
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Görsel Ayarları</h3>

                <Input
                    label="Badge Metni"
                    value={formData.badge_text || ''}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value || null })}
                    placeholder="FLASH!, %30, HAFTA SONU"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Badge Rengi</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={formData.badge_color}
                                onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <Input
                                value={formData.badge_color}
                                onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arka Plan Rengi</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={formData.background_color}
                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                            />
                            <Input
                                value={formData.background_color}
                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kampanya Görseli</label>
                    <ImageUpload
                        value={campaign?.image_url || undefined}
                        onChange={handleImageChange}
                        multiple={false}
                        maxFiles={1}
                    />
                </div>
            </div>

            {/* Status & Order */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Durum ve Sıralama</h3>

                <Input
                    label="Sıralama"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />

                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Aktif</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Öne Çıkar</span>
                    </label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    İptal
                </Button>
                <Button type="submit" loading={loading}>
                    {campaign ? 'Güncelle' : 'Kaydet'}
                </Button>
            </div>
        </form>
    );
}
