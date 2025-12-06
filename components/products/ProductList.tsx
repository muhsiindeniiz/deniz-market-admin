'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash2, Package } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onDelete: (id: string, images: string[]) => void;
}

export function ProductList({
  products,
  selectedIds,
  onSelect,
  onSelectAll,
  onDelete,
}: ProductListProps) {
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < products.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
          </TableHead>
          <TableHead>Ürün</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead>Fiyat</TableHead>
          <TableHead>Stok</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead className="text-right">İşlem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className={selectedIds.includes(product.id) ? 'bg-green-50' : ''}
          >
            <TableCell>
              <input
                type="checkbox"
                checked={selectedIds.includes(product.id)}
                onChange={() => onSelect(product.id)}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.unit}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{product.category?.name || '-'}</TableCell>
            <TableCell>
              <div>
                {product.discount_price ? (
                  <>
                    <p className="font-medium text-green-600">
                      {formatCurrency(product.discount_price)}
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.price)}
                    </p>
                  </>
                ) : (
                  <p className="font-medium">{formatCurrency(product.price)}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}
              >
                {product.stock} adet
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {product.is_featured && (
                  <Badge variant="info" size="sm">
                    Öne Çıkan
                  </Badge>
                )}
                {product.is_on_sale && (
                  <Badge variant="danger" size="sm">
                    İndirimli
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-2">
                <Link href={`/dashboard/products/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
                      onDelete(product.id, product.images);
                    }
                  }}
                >
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
