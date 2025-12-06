// hooks/useSettings.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
    ContactInfo,
    WorkingHours,
    FAQCategory,
    FAQItem,
    TermsAndConditions,
    PrivacyPolicy,
    ContactMessage,
} from '@/lib/types';
import toast from 'react-hot-toast';

export function useSettings() {
    const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
    const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
    const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
    const [terms, setTerms] = useState<TermsAndConditions | null>(null);
    const [privacy, setPrivacy] = useState<PrivacyPolicy | null>(null);
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    // Contact Info
    const fetchContactInfo = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('contact_info').select('*').order('sort_order');

            if (error) throw error;
            setContactInfo(data || []);
        } catch (error) {
            console.error('Error fetching contact info:', error);
        }
    }, []);

    const saveContactInfo = async (info: Partial<ContactInfo>): Promise<boolean> => {
        try {
            if (info.id) {
                const { data: updated, error } = await supabase
                    .from('contact_info')
                    .update({ ...info, updated_at: new Date().toISOString() })
                    .eq('id', info.id)
                    .select()
                    .single();
                if (error) throw error;
                if (updated) {
                    setContactInfo((prev) =>
                        prev.map((c) => (c.id === info.id ? updated : c)).sort((a, b) => a.sort_order - b.sort_order)
                    );
                }
            } else {
                const { data: created, error } = await supabase
                    .from('contact_info')
                    .insert(info)
                    .select()
                    .single();
                if (error) throw error;
                if (created) {
                    setContactInfo((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
                }
            }

            toast.success('İletişim bilgisi kaydedildi');
            return true;
        } catch (error) {
            console.error('Error saving contact info:', error);
            toast.error('İletişim bilgisi kaydedilemedi');
            return false;
        }
    };

    const deleteContactInfo = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from('contact_info').delete().eq('id', id);
            if (error) throw error;

            setContactInfo((prev) => prev.filter((c) => c.id !== id));
            toast.success('İletişim bilgisi silindi');
            return true;
        } catch (error) {
            console.error('Error deleting contact info:', error);
            toast.error('İletişim bilgisi silinemedi');
            return false;
        }
    };

    // Working Hours
    const fetchWorkingHours = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('working_hours').select('*').order('sort_order');

            if (error) throw error;
            setWorkingHours(data || []);
        } catch (error) {
            console.error('Error fetching working hours:', error);
        }
    }, []);

    const saveWorkingHours = async (hours: Partial<WorkingHours>): Promise<boolean> => {
        try {
            if (hours.id) {
                const { data: updated, error } = await supabase
                    .from('working_hours')
                    .update({ ...hours, updated_at: new Date().toISOString() })
                    .eq('id', hours.id)
                    .select()
                    .single();
                if (error) throw error;
                if (updated) {
                    setWorkingHours((prev) =>
                        prev.map((w) => (w.id === hours.id ? updated : w)).sort((a, b) => a.sort_order - b.sort_order)
                    );
                }
            } else {
                const { data: created, error } = await supabase
                    .from('working_hours')
                    .insert(hours)
                    .select()
                    .single();
                if (error) throw error;
                if (created) {
                    setWorkingHours((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order));
                }
            }

            toast.success('Çalışma saati kaydedildi');
            return true;
        } catch (error) {
            console.error('Error saving working hours:', error);
            toast.error('Çalışma saati kaydedilemedi');
            return false;
        }
    };

    const deleteWorkingHours = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from('working_hours').delete().eq('id', id);
            if (error) throw error;

            setWorkingHours((prev) => prev.filter((w) => w.id !== id));
            toast.success('Çalışma saati silindi');
            return true;
        } catch (error) {
            console.error('Error deleting working hours:', error);
            toast.error('Çalışma saati silinemedi');
            return false;
        }
    };

    // FAQ - Düzeltilmiş versiyon
    const fetchFAQ = useCallback(async () => {
        try {
            // Önce kategorileri al
            const { data: categories, error: catError } = await supabase
                .from('faq_categories')
                .select('*')
                .order('sort_order');

            if (catError) throw catError;

            // Sonra tüm FAQ items'ları al
            const { data: items, error: itemsError } = await supabase
                .from('faq_items')
                .select('*')
                .order('sort_order');

            if (itemsError) throw itemsError;

            // Items'ları kategorilere eşle
            const categoriesWithItems = (categories || []).map((category) => ({
                ...category,
                items: (items || []).filter((item) => item.category_id === category.id),
            }));

            setFaqCategories(categoriesWithItems);
        } catch (error) {
            console.error('Error fetching FAQ:', error);
        }
    }, []);

    const saveFAQCategory = async (category: Partial<FAQCategory>): Promise<boolean> => {
        try {
            if (category.id) {
                const { error } = await supabase
                    .from('faq_categories')
                    .update({
                        name: category.name,
                        sort_order: category.sort_order,
                        is_active: category.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', category.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('faq_categories').insert({
                    name: category.name,
                    sort_order: category.sort_order,
                    is_active: category.is_active,
                });
                if (error) throw error;
            }

            toast.success('FAQ kategorisi kaydedildi');
            fetchFAQ();
            return true;
        } catch (error) {
            console.error('Error saving FAQ category:', error);
            toast.error('FAQ kategorisi kaydedilemedi');
            return false;
        }
    };

    const deleteFAQCategory = async (id: string): Promise<boolean> => {
        try {
            // Önce kategoriye ait tüm soruları sil
            await supabase.from('faq_items').delete().eq('category_id', id);

            const { error } = await supabase.from('faq_categories').delete().eq('id', id);
            if (error) throw error;

            setFaqCategories((prev) => prev.filter((c) => c.id !== id));
            toast.success('FAQ kategorisi silindi');
            return true;
        } catch (error) {
            console.error('Error deleting FAQ category:', error);
            toast.error('FAQ kategorisi silinemedi');
            return false;
        }
    };

    const saveFAQItem = async (item: Partial<FAQItem>): Promise<boolean> => {
        try {
            if (item.id) {
                const { data: updated, error } = await supabase
                    .from('faq_items')
                    .update({
                        category_id: item.category_id,
                        question: item.question,
                        answer: item.answer,
                        sort_order: item.sort_order,
                        is_active: item.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', item.id)
                    .select()
                    .single();
                if (error) throw error;
                if (updated) {
                    setFaqCategories((prev) =>
                        prev.map((cat) => ({
                            ...cat,
                            items: (cat.items || []).map((i) => (i.id === item.id ? updated : i)),
                        }))
                    );
                }
            } else {
                const { data: created, error } = await supabase
                    .from('faq_items')
                    .insert({
                        category_id: item.category_id,
                        question: item.question,
                        answer: item.answer,
                        sort_order: item.sort_order,
                        is_active: item.is_active,
                    })
                    .select()
                    .single();
                if (error) throw error;
                if (created) {
                    setFaqCategories((prev) =>
                        prev.map((cat) =>
                            cat.id === item.category_id
                                ? { ...cat, items: [...(cat.items || []), created].sort((a, b) => a.sort_order - b.sort_order) }
                                : cat
                        )
                    );
                }
            }

            toast.success('FAQ öğesi kaydedildi');
            return true;
        } catch (error) {
            console.error('Error saving FAQ item:', error);
            toast.error('FAQ öğesi kaydedilemedi');
            return false;
        }
    };

    const deleteFAQItem = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from('faq_items').delete().eq('id', id);
            if (error) throw error;

            setFaqCategories((prev) =>
                prev.map((cat) => ({
                    ...cat,
                    items: (cat.items || []).filter((i) => i.id !== id),
                }))
            );
            toast.success('FAQ öğesi silindi');
            return true;
        } catch (error) {
            console.error('Error deleting FAQ item:', error);
            toast.error('FAQ öğesi silinemedi');
            return false;
        }
    };

    // Terms & Conditions
    const fetchTerms = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('terms_and_conditions')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setTerms(data || null);
        } catch (error) {
            console.error('Error fetching terms:', error);
        }
    }, []);

    const saveTerms = async (termsData: Partial<TermsAndConditions>): Promise<boolean> => {
        try {
            // Önce mevcut aktif olanı pasif yap
            await supabase.from('terms_and_conditions').update({ is_active: false }).eq('is_active', true);

            // Yeni versiyon ekle
            const { error } = await supabase.from('terms_and_conditions').insert({
                content: termsData.content,
                version: termsData.version,
                is_active: true,
            });

            if (error) throw error;

            toast.success('Kullanım koşulları kaydedildi');
            fetchTerms();
            return true;
        } catch (error) {
            console.error('Error saving terms:', error);
            toast.error('Kullanım koşulları kaydedilemedi');
            return false;
        }
    };

    // Privacy Policy
    const fetchPrivacy = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('privacy_policies')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            setPrivacy(data || null);
        } catch (error) {
            console.error('Error fetching privacy:', error);
        }
    }, []);

    const savePrivacy = async (privacyData: Partial<PrivacyPolicy>): Promise<boolean> => {
        try {
            // Önce mevcut aktif olanı pasif yap
            await supabase.from('privacy_policies').update({ is_active: false }).eq('is_active', true);

            // Yeni versiyon ekle
            const { error } = await supabase.from('privacy_policies').insert({
                content: privacyData.content,
                version: privacyData.version,
                is_active: true,
            });

            if (error) throw error;

            toast.success('Gizlilik politikası kaydedildi');
            fetchPrivacy();
            return true;
        } catch (error) {
            console.error('Error saving privacy:', error);
            toast.error('Gizlilik politikası kaydedilemedi');
            return false;
        }
    };

    // Contact Messages
    const fetchMessages = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, []);

    const markMessageAsRead = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ is_read: true, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
            return true;
        } catch (error) {
            console.error('Error marking message as read:', error);
            return false;
        }
    };

    const markMessageAsResolved = async (id: string, resolved: boolean): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('contact_messages')
                .update({ is_resolved: resolved, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_resolved: resolved } : m)));
            toast.success(
                resolved ? 'Mesaj çözüldü olarak işaretlendi' : 'Mesaj çözülmedi olarak işaretlendi'
            );
            return true;
        } catch (error) {
            console.error('Error marking message as resolved:', error);
            toast.error('İşlem başarısız');
            return false;
        }
    };

    const deleteMessage = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase.from('contact_messages').delete().eq('id', id);
            if (error) throw error;

            setMessages((prev) => prev.filter((m) => m.id !== id));
            toast.success('Mesaj silindi');
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Mesaj silinemedi');
            return false;
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([
                fetchContactInfo(),
                fetchWorkingHours(),
                fetchFAQ(),
                fetchTerms(),
                fetchPrivacy(),
                fetchMessages(),
            ]);
            setLoading(false);
        };
        loadAll();
    }, [fetchContactInfo, fetchWorkingHours, fetchFAQ, fetchTerms, fetchPrivacy, fetchMessages]);

    return {
        contactInfo,
        workingHours,
        faqCategories,
        terms,
        privacy,
        messages,
        loading,
        fetchContactInfo,
        saveContactInfo,
        deleteContactInfo,
        fetchWorkingHours,
        saveWorkingHours,
        deleteWorkingHours,
        fetchFAQ,
        saveFAQCategory,
        deleteFAQCategory,
        saveFAQItem,
        deleteFAQItem,
        fetchTerms,
        saveTerms,
        fetchPrivacy,
        savePrivacy,
        fetchMessages,
        markMessageAsRead,
        markMessageAsResolved,
        deleteMessage,
    };
}