'use client';

import { useState } from 'react';
import { useWheelSpins } from '@/hooks/useWheelSpins';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { WheelPrizeType } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Trash2,
  Gift,
  Percent,
  Truck,
  RotateCw,
  XCircle,
  TrendingUp,
  Calendar,
  Ticket,
  Users,
} from 'lucide-react';

const PRIZE_TYPE_LABELS: Record<WheelPrizeType, string> = {
  discount_fixed: 'Sabit İndirim',
  discount_percentage: 'Yüzde İndirim',
  free_delivery: 'Ücretsiz Teslimat',
  bonus_spin: 'Bonus Çevirme',
  no_prize: 'Ödül Yok',
};

const PRIZE_TYPE_ICONS: Record<WheelPrizeType, React.ReactNode> = {
  discount_fixed: <Gift className="w-4 h-4" />,
  discount_percentage: <Percent className="w-4 h-4" />,
  free_delivery: <Truck className="w-4 h-4" />,
  bonus_spin: <RotateCw className="w-4 h-4" />,
  no_prize: <XCircle className="w-4 h-4" />,
};

export default function WheelSpinsPage() {
  const { spins, loading, stats, deleteSpin } = useWheelSpins();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpins = spins.filter((spin) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const userName = (spin.user as { full_name?: string })?.full_name?.toLowerCase() || '';
    const userEmail = (spin.user as { email?: string })?.email?.toLowerCase() || '';
    const prizeLabel = (spin.prize as { label?: string })?.label?.toLowerCase() || '';
    const couponCode = (spin.coupon as { code?: string })?.code?.toLowerCase() || '';
    return (
      userName.includes(query) ||
      userEmail.includes(query) ||
      prizeLabel.includes(query) ||
      couponCode.includes(query)
    );
  });

  const handleDelete = async (id: string) => {
    if (confirm('Bu çevirme kaydını silmek istediğinizden emin misiniz?')) {
      await deleteSpin(id);
    }
  };

  const getPrizeValueDisplay = (prize: { prize_type?: WheelPrizeType; prize_value?: number }) => {
    if (!prize) return '-';
    switch (prize.prize_type) {
      case 'discount_fixed':
        return formatCurrency(prize.prize_value || 0);
      case 'discount_percentage':
        return `%${prize.prize_value}`;
      case 'free_delivery':
        return 'Ücretsiz';
      case 'bonus_spin':
        return '+1 Hak';
      case 'no_prize':
        return '-';
      default:
        return prize.prize_value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Çark Geçmişi</h1>
          <p className="text-gray-500 mt-1">Kullanıcıların çark çevirme geçmişini görüntüleyin</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Toplam Çevirme</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalSpins}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bu Hafta</p>
                <p className="text-xl font-bold text-gray-900">{stats.thisWeekSpins}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Bu Ay</p>
                <p className="text-xl font-bold text-gray-900">{stats.thisMonthSpins}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Kupon Oluşturulan</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalCouponsGenerated}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Prize Type Distribution */}
      {stats && Object.keys(stats.spinsByPrizeType).length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-gray-900 mb-3">Ödül Dağılımı</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.spinsByPrizeType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
              >
                {PRIZE_TYPE_ICONS[type as WheelPrizeType]}
                <span className="text-sm text-gray-600">
                  {PRIZE_TYPE_LABELS[type as WheelPrizeType] || type}:
                </span>
                <span className="font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kullanıcı, ödül veya kupon ara..."
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : filteredSpins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'Sonuç bulunamadı' : 'Henüz çark çevirme kaydı yok'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Ödül</TableHead>
                <TableHead>Değer</TableHead>
                <TableHead>Kupon</TableHead>
                <TableHead>Hafta/Yıl</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpins.map((spin) => {
                const user = spin.user as { full_name?: string; email?: string } | undefined;
                const prize = spin.prize as {
                  label?: string;
                  prize_type?: WheelPrizeType;
                  prize_value?: number;
                  color?: string;
                } | undefined;
                const coupon = spin.coupon as {
                  code?: string;
                  is_active?: boolean;
                } | undefined;

                return (
                  <TableRow key={spin.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{user?.full_name || '-'}</p>
                        <p className="text-sm text-gray-500">{user?.email || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-6 h-6 rounded flex items-center justify-center text-white"
                          style={{ backgroundColor: prize?.color || '#888' }}
                        >
                          {prize?.prize_type && PRIZE_TYPE_ICONS[prize.prize_type]}
                        </span>
                        <span className="font-medium">{prize?.label || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {getPrizeValueDisplay(prize || {})}
                    </TableCell>
                    <TableCell>
                      {coupon?.code ? (
                        <div>
                          <span className="font-mono text-sm font-bold text-green-600">
                            {coupon.code}
                          </span>
                          <Badge
                            variant={coupon.is_active ? 'success' : 'default'}
                            className="ml-2"
                          >
                            {coupon.is_active ? 'Aktif' : 'Kullanıldı'}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {spin.week_number}. Hafta / {spin.year}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(spin.spun_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(spin.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
