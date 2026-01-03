'use client';

import { useState } from 'react';
import { useCampaigns, CampaignFormData } from '@/hooks/useCampaigns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { CampaignList } from '@/components/campaigns/CampaignList';
import { Campaign, CampaignType } from '@/lib/types';
import { CAMPAIGN_TYPE_LABELS } from '@/lib/constants';
import { Plus, Search, Filter } from 'lucide-react';

export default function CampaignsPage() {
    const {
        campaigns,
        categories,
        products,
        loading,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        toggleCampaignStatus,
        toggleFeatured,
    } = useCampaigns();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const handleCreate = () => {
        setEditingCampaign(null);
        setIsModalOpen(true);
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingCampaign(null);
    };

    const handleSubmit = async (data: CampaignFormData, imageFile?: File): Promise<boolean> => {
        setFormLoading(true);

        let success;
        if (editingCampaign) {
            success = await updateCampaign(editingCampaign.id, data, imageFile);
        } else {
            success = await createCampaign(data, imageFile);
        }

        setFormLoading(false);

        if (success) {
            handleClose();
        }

        return success;
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) {
            await deleteCampaign(id);
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        await toggleCampaignStatus(id, isActive);
    };

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        await toggleFeatured(id, isFeatured);
    };

    // Filter campaigns
    const filteredCampaigns = campaigns.filter((campaign) => {
        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            if (
                !campaign.name.toLowerCase().includes(search) &&
                !campaign.description?.toLowerCase().includes(search) &&
                !campaign.brand_name?.toLowerCase().includes(search)
            ) {
                return false;
            }
        }

        // Type filter
        if (filterType !== 'all' && campaign.campaign_type !== filterType) {
            return false;
        }

        // Status filter
        if (filterStatus !== 'all') {
            const now = new Date();
            const startDate = new Date(campaign.start_date);
            const endDate = new Date(campaign.end_date);

            if (filterStatus === 'active') {
                if (!campaign.is_active || now < startDate || now > endDate) {
                    return false;
                }
            } else if (filterStatus === 'inactive') {
                if (campaign.is_active) {
                    return false;
                }
            } else if (filterStatus === 'expired') {
                if (now <= endDate) {
                    return false;
                }
            } else if (filterStatus === 'upcoming') {
                if (now >= startDate) {
                    return false;
                }
            }
        }

        return true;
    });

    const typeOptions = [
        { value: 'all', label: 'Tüm Türler' },
        ...Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
        })),
    ];

    const statusOptions = [
        { value: 'all', label: 'Tüm Durumlar' },
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Pasif' },
        { value: 'expired', label: 'Süresi Dolmuş' },
        { value: 'upcoming', label: 'Yakında' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kampanya Yönetimi</h1>
                    <p className="text-gray-500 mt-1">
                        Tüm kampanyalarınızı buradan yönetebilirsiniz
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kampanya
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Kampanya ara..."
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            options={typeOptions}
                            className="w-40"
                        />
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            options={statusOptions}
                            className="w-40"
                        />
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
                    <div className="text-sm text-gray-500">Toplam Kampanya</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {campaigns.filter((c) => {
                            const now = new Date();
                            return c.is_active && new Date(c.start_date) <= now && new Date(c.end_date) >= now;
                        }).length}
                    </div>
                    <div className="text-sm text-gray-500">Aktif Kampanya</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                        {campaigns.filter((c) => c.is_featured).length}
                    </div>
                    <div className="text-sm text-gray-500">Öne Çıkan</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                        {campaigns.reduce((acc, c) => acc + c.current_uses, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Toplam Kullanım</div>
                </Card>
            </div>

            {/* Campaign List */}
            <Card>
                {loading ? (
                    <Loading />
                ) : filteredCampaigns.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                            ? 'Arama kriterlerine uygun kampanya bulunamadı'
                            : 'Henüz kampanya yok'}
                    </div>
                ) : (
                    <CampaignList
                        campaigns={filteredCampaigns}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onToggleFeatured={handleToggleFeatured}
                    />
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleClose}
                title={editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}
                size="lg"
            >
                <CampaignForm
                    campaign={editingCampaign}
                    categories={categories}
                    products={products}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    loading={formLoading}
                />
            </Modal>
        </div>
    );
}
