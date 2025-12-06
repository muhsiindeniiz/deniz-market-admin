'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Review } from '@/lib/types';
import toast from 'react-hot-toast';

interface UseReviewsOptions {
  page?: number;
  productId?: string;
  minRating?: number;
  maxRating?: number;
}

export function useReviews(options: UseReviewsOptions = {}) {
  const { page = 1, productId, minRating, maxRating } = options;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });

  const pageSize = 10;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select(
          `
          *,
          user:users (
            id,
            full_name,
            email
          ),
          product:products (
            id,
            name,
            images
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (minRating) {
        query = query.gte('rating', minRating);
      }

      if (maxRating) {
        query = query.lte('rating', maxRating);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      // Her review için kullanıcının o ürünü içeren siparişini bul
      const reviewsWithOrders = await Promise.all(
        (data || []).map(async (review) => {
          // Kullanıcının bu ürünü içeren siparişlerini bul
          const { data: orderItems } = await supabase
            .from('order_items')
            .select(
              `
              id,
              product_id,
              quantity,
              order:orders!inner (
                id,
                order_number,
                user_id
              ),
              product:products (
                id,
                name,
                images
              )
            `
            )
            .eq('product_id', review.product_id)
            .eq('orders.user_id', review.user_id)
            .order('created_at', { ascending: false })
            .limit(1);

          if (orderItems && orderItems.length > 0) {
            const orderRaw = orderItems[0].order as unknown as { id: string; order_number: string };
            // Bu siparişin tüm ürünlerini al
            const { data: allOrderItems } = await supabase
              .from('order_items')
              .select(
                `
                id,
                product_id,
                quantity,
                product:products (
                  id,
                  name,
                  images
                )
              `
              )
              .eq('order_id', orderRaw.id);

            return {
              ...review,
              order: {
                id: orderRaw.id,
                order_number: orderRaw.order_number,
                items: allOrderItems || [],
              },
            };
          }

          return review;
        })
      );

      setReviews(reviewsWithOrders);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Değerlendirmeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [page, productId, minRating, maxRating]);

  const fetchStats = useCallback(async () => {
    try {
      const { data: allReviews, error } = await supabase.from('reviews').select('rating');

      if (error) throw error;

      if (!allReviews || allReviews.length === 0) {
        setStats({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
        return;
      }

      const totalReviews = allReviews.length;
      const averageRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allReviews.forEach((r) => {
        const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating]++;
        }
      });

      setStats({
        totalReviews,
        averageRating,
        ratingDistribution,
      });
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  }, []);

  const deleteReview = async (id: string) => {
    try {
      // Silinecek review'ın rating'ini al (stats güncellemesi için)
      const reviewToDelete = reviews.find((r) => r.id === id);

      const { error } = await supabase.from('reviews').delete().eq('id', id);

      if (error) throw error;

      // State'i hemen güncelle
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setTotalCount((prev) => prev - 1);

      // Stats'ı güncelle
      if (reviewToDelete) {
        setStats((prev) => {
          const newTotal = prev.totalReviews - 1;
          const rating = Math.round(reviewToDelete.rating) as 1 | 2 | 3 | 4 | 5;
          const newDistribution = { ...prev.ratingDistribution };
          if (rating >= 1 && rating <= 5) {
            newDistribution[rating] = Math.max(0, newDistribution[rating] - 1);
          }
          const newAverage = newTotal > 0
            ? (prev.averageRating * prev.totalReviews - reviewToDelete.rating) / newTotal
            : 0;
          return {
            totalReviews: newTotal,
            averageRating: newAverage,
            ratingDistribution: newDistribution,
          };
        });
      }

      toast.success('Değerlendirme silindi');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Değerlendirme silinirken hata oluştu');
    }
  };

  const deleteMultipleReviews = async (ids: string[]) => {
    try {
      // Silinecek review'ların rating'lerini al
      const reviewsToDelete = reviews.filter((r) => ids.includes(r.id));

      const { error } = await supabase.from('reviews').delete().in('id', ids);

      if (error) throw error;

      // State'i hemen güncelle
      setReviews((prev) => prev.filter((r) => !ids.includes(r.id)));
      setTotalCount((prev) => prev - ids.length);

      // Stats'ı güncelle
      if (reviewsToDelete.length > 0) {
        setStats((prev) => {
          const newTotal = prev.totalReviews - reviewsToDelete.length;
          const newDistribution = { ...prev.ratingDistribution };
          let removedSum = 0;

          reviewsToDelete.forEach((r) => {
            const rating = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
            if (rating >= 1 && rating <= 5) {
              newDistribution[rating] = Math.max(0, newDistribution[rating] - 1);
            }
            removedSum += r.rating;
          });

          const newAverage = newTotal > 0
            ? (prev.averageRating * prev.totalReviews - removedSum) / newTotal
            : 0;

          return {
            totalReviews: newTotal,
            averageRating: newAverage,
            ratingDistribution: newDistribution,
          };
        });
      }

      toast.success(`${ids.length} değerlendirme silindi`);
    } catch (error) {
      console.error('Error deleting reviews:', error);
      toast.error('Değerlendirmeler silinirken hata oluştu');
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  return {
    reviews,
    totalCount,
    loading,
    stats,
    pageSize,
    deleteReview,
    deleteMultipleReviews,
    refetch: fetchReviews,
  };
}
