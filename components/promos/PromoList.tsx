// components/promos/PromoList.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Promo } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, Trash2, GripVertical } from 'lucide-react';

interface PromoListProps {
    promos: Promo[];
    onEdit: (promo: Promo) => void;
    onDelete: (id: string, imageUrl: string) => void;
    onReorder: (items: { id: string; sort_order: number }[]) => void;
}

interface SortablePromoItemProps {
    promo: Promo;
    onEdit: (promo: Promo) => void;
    onDelete: (id: string, imageUrl: string) => void;
}

function SortablePromoItem({ promo, onEdit, onDelete }: SortablePromoItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: promo.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card padding="sm" className={`group ${isDragging ? 'shadow-lg ring-2 ring-green-500' : ''}`}>
                <div className="flex items-center gap-4">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>

                    <div
                        className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0"
                        style={{
                            background: `linear-gradient(135deg, ${promo.gradient_start}, ${promo.gradient_end})`,
                        }}
                    >
                        {promo.image_url && (
                            <img
                                src={promo.image_url}
                                alt={promo.title}
                                className="w-full h-full object-cover mix-blend-overlay"
                            />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{promo.title}</h4>
                        <p className="text-sm text-gray-500 truncate">{promo.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={promo.is_active ? 'success' : 'default'} size="sm">
                                {promo.is_active ? 'Aktif' : 'Pasif'}
                            </Badge>
                            <span className="text-xs text-gray-400">Sıra: {promo.sort_order}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(promo)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) {
                                    onDelete(promo.id, promo.image_url);
                                }
                            }}
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function PromoOverlay({ promo }: { promo: Promo }) {
    return (
        <Card padding="sm" className="shadow-2xl ring-2 ring-green-500 bg-white">
            <div className="flex items-center gap-4">
                <div className="text-gray-400">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div
                    className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0"
                    style={{
                        background: `linear-gradient(135deg, ${promo.gradient_start}, ${promo.gradient_end})`,
                    }}
                >
                    {promo.image_url && (
                        <img
                            src={promo.image_url}
                            alt={promo.title}
                            className="w-full h-full object-cover mix-blend-overlay"
                        />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{promo.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{promo.subtitle}</p>
                </div>
            </div>
        </Card>
    );
}

export function PromoList({ promos, onEdit, onDelete, onReorder }: PromoListProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [items, setItems] = useState(promos);

    // promos değiştiğinde items'ı güncelle
    useEffect(() => {
        setItems(promos);
    }, [promos]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            // Yeni sıralamayı kaydet
            const reorderedItems = newItems.map((item, index) => ({
                id: item.id,
                sort_order: index + 1,
            }));

            onReorder(reorderedItems);
        }
    };

    const activePromo = activeId ? items.find((item) => item.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {items.map((promo) => (
                        <SortablePromoItem key={promo.id} promo={promo} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay>{activePromo ? <PromoOverlay promo={activePromo} /> : null}</DragOverlay>
        </DndContext>
    );
}