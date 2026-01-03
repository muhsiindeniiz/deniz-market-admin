'use client';

import { Campaign } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/Table';
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_COLORS, DISCOUNT_TYPE_LABELS, DAY_LABELS } from '@/lib/constants';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import {
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Zap,
    Calendar,
    ShoppingCart,
    Tag,
    Cake,
    FolderOpen,
    Package,
    Gift,
    Truck,
} from 'lucide-react';

interface CampaignListProps {
    campaigns: Campaign[];
    onEdit: (campaign: Campaign) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, isActive: boolean) => void;
    onToggleFeatured: (id: string, isFeatured: boolean) => void;
}

const CAMPAIGN_TYPE_ICONS: Record<string, React.ReactNode> = {
    flash_sale: <Zap className="w-4 h-4" />,
    weekend: <Calendar className="w-4 h-4" />,
    min_cart: <ShoppingCart className="w-4 h-4" />,
    brand: <Tag className="w-4 h-4" />,
    birthday: <Cake className="w-4 h-4" />,
    category: <FolderOpen className="w-4 h-4" />,
    product: <Package className="w-4 h-4" />,
    first_order: <Gift className="w-4 h-4" />,
    free_delivery: <Truck className="w-4 h-4" />,
};

export function CampaignList({
    campaigns,
    onEdit,
    onDelete,
    onToggleStatus,
    onToggleFeatured,
}: CampaignListProps) {
    const formatDiscount = (campaign: Campaign) => {
        if (campaign.discount_type === 'free_delivery') {
            return 'Ücretsiz Kargo';
        }
        if (campaign.discount_type === 'percentage') {
            return `%${campaign.discount_value}`;
        }
        return formatCurrency(campaign.discount_value);
    };

    const formatConditions = (campaign: Campaign) => {
        const conditions: string[] = [];

        if (campaign.min_order_amount > 0) {
            conditions.push(`Min: ${formatCurrency(campaign.min_order_amount)}`);
        }

        if (campaign.campaign_type === 'flash_sale' && campaign.start_time && campaign.end_time) {
            conditions.push(`${campaign.start_time} - ${campaign.end_time}`);
        }

        if (campaign.campaign_type === 'weekend' && campaign.valid_days?.length > 0) {
            const days = campaign.valid_days.map((d) => DAY_LABELS[d]).join(', ');
            conditions.push(days);
        }

        if (campaign.campaign_type === 'brand' && campaign.brand_name) {
            conditions.push(campaign.brand_name);
        }

        if (campaign.campaign_type === 'product' && campaign.campaign_products?.length) {
            conditions.push(`${campaign.campaign_products.length} ürün`);
        }

        if (campaign.campaign_type === 'category' && campaign.campaign_categories?.length) {
            conditions.push(`${campaign.campaign_categories.length} kategori`);
        }

        return conditions.length > 0 ? conditions.join(' | ') : '-';
    };

    const isExpired = (campaign: Campaign) => {
        return new Date(campaign.end_date) < new Date();
    };

    const isUpcoming = (campaign: Campaign) => {
        return new Date(campaign.start_date) > new Date();
    };

    const getStatusBadge = (campaign: Campaign) => {
        if (!campaign.is_active) {
            return <Badge variant="default">Pasif</Badge>;
        }
        if (isExpired(campaign)) {
            return <Badge variant="danger">Süresi Doldu</Badge>;
        }
        if (isUpcoming(campaign)) {
            return <Badge variant="warning">Yakında</Badge>;
        }
        return <Badge variant="success">Aktif</Badge>;
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Kampanya</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>İndirim</TableHead>
                    <TableHead>Koşullar</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Kullanım</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                {campaign.image_url ? (
                                    <div
                                        className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                                        style={{ backgroundColor: campaign.background_color }}
                                    >
                                        <img
                                            src={campaign.image_url}
                                            alt={campaign.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{
                                            backgroundColor: campaign.background_color,
                                            color: campaign.badge_color,
                                        }}
                                    >
                                        {CAMPAIGN_TYPE_ICONS[campaign.campaign_type]}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{campaign.name}</span>
                                        {campaign.is_featured && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        )}
                                    </div>
                                    {campaign.badge_text && (
                                        <span
                                            className="inline-block text-xs font-bold px-1.5 py-0.5 rounded mt-1"
                                            style={{
                                                backgroundColor: campaign.badge_color,
                                                color: '#fff',
                                            }}
                                        >
                                            {campaign.badge_text}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${CAMPAIGN_TYPE_COLORS[campaign.campaign_type]}`}>
                                {CAMPAIGN_TYPE_ICONS[campaign.campaign_type]}
                                {CAMPAIGN_TYPE_LABELS[campaign.campaign_type]}
                            </span>
                        </TableCell>
                        <TableCell>
                            <span className="font-semibold text-green-600">
                                {formatDiscount(campaign)}
                            </span>
                            {campaign.max_discount && (
                                <span className="text-xs text-gray-500 block">
                                    Max: {formatCurrency(campaign.max_discount)}
                                </span>
                            )}
                        </TableCell>
                        <TableCell>
                            <span className="text-sm text-gray-600">{formatConditions(campaign)}</span>
                        </TableCell>
                        <TableCell>
                            <div className="text-sm">
                                <div className="text-gray-900">{formatDateShort(campaign.start_date)}</div>
                                <div className="text-gray-500">{formatDateShort(campaign.end_date)}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="text-sm">
                                {campaign.current_uses} / {campaign.max_uses || '∞'}
                            </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(campaign)}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onToggleFeatured(campaign.id, !campaign.is_featured)}
                                    title={campaign.is_featured ? 'Öne çıkarmayı kaldır' : 'Öne çıkar'}
                                >
                                    <Star
                                        className={`w-4 h-4 ${
                                            campaign.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                                        }`}
                                    />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onToggleStatus(campaign.id, !campaign.is_active)}
                                    title={campaign.is_active ? 'Pasife al' : 'Aktif et'}
                                >
                                    {campaign.is_active ? (
                                        <Eye className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    )}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => onDelete(campaign.id)}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
