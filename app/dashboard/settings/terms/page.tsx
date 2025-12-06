'use client'; import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link'; export default function TermsPage() {
  const { terms, loading, saveTerms } = useSettings();
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('');
  const [saving, setSaving] = useState(false); useEffect(() => {
    if (terms) {
      setContent(terms.content);
      setVersion(terms.version);
    }
  }, [terms]); const handleSave = async () => {
    if (!content.trim()) {
      alert('Lütfen içerik girin');
      return;
    }
    if (!version.trim()) {
      alert('Lütfen versiyon numarası girin');
      return;
    } setSaving(true);
    await saveTerms({ content, version });
    setSaving(false);
  }; return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Kullanım Koşulları</h1>
          <p className="text-gray-500 mt-1">Uygulama kullanım koşullarını düzenleyin</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Kaydet
        </Button>
      </div>  {loading ? (
        <Loading />
      ) : (
        <Card>
          <div className="space-y-6">
            <Input
              label="Versiyon"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="örn: 1.0.0"
            />        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Kullanım koşulları metninizi buraya yazın..."
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
