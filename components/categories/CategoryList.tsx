'use client';
import { Category } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, FolderTree } from 'lucide-react';
interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string, imageUrl?: string | null) => void;
}
export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Card key={category.id} padding="sm" className="group">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.icon}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{category.name}</h4>
              <p className="text-sm text-gray-500">{category.item_count} ürün</p>
              <div
                className="w-4 h-4 rounded-full mt-2"
                style={{ backgroundColor: category.color }}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
                  onDelete(category.id, category.image_url);
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
