'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Topbar } from '@/components/admin/Topbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Card, CardHeader, Alert } from '@/components/ui/Badge';
import { TableAction } from '@/components/ui/DataTable';

type Category = { id: string; label: string; sortOrder: number };

const categorySchema = z.object({
  label: z.string().min(2, 'Nom requis'),
  id: z.string().min(2, 'Identifiant requis').regex(/^[a-z0-9_]+$/, 'Minuscules et underscores uniquement'),
  sortOrder: z.number().int().optional().default(0),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { sortOrder: 0 },
  });

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories((data.categories || []).filter((c: Category) => c.id !== 'all'));
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const onSubmit = async (data: CategoryForm) => {
    setSaving(true);
    setApiError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setShowModal(false);
      reset();
      fetchCategories();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur');
      setDeleteId(null);
    }
  };

  return (
    <div>
      <Topbar title="Catégories" subtitle={`${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}>
        <Button size="sm" onClick={() => { setShowModal(true); setApiError(''); reset(); }}>
          + Ajouter une catégorie
        </Button>
      </Topbar>

      <div className="p-6">
        {apiError && <Alert variant="danger">{apiError}</Alert>}

        <Card>
          <CardHeader title="Toutes les catégories" subtitle="Utilisées pour filtrer les produits dans le catalogue" />
          {loading ? (
            <div className="p-8 text-center text-sm text-text-light animate-pulse">Chargement…</div>
          ) : (
            <div className="divide-y divide-bg">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <div className="font-medium text-[15px] text-text">{cat.label}</div>
                    <div className="text-xs text-text-light font-mono mt-0.5">id : {cat.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-light">Ordre : {cat.sortOrder}</span>
                    <TableAction
                      onClick={() => setDeleteId(cat.id)}
                      title="Supprimer"
                      variant="danger"
                    >
                      🗑
                    </TableAction>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-8 text-center text-sm text-text-light">
                  Aucune catégorie. Ajoutez-en une.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Modal ajouter */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ajouter une catégorie" size="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3 mb-4">
            <Input
              label="Nom affiché *"
              placeholder="Ex: Céréales"
              error={errors.label?.message}
              {...register('label')}
            />
            <Input
              label="Identifiant unique *"
              placeholder="Ex: cereales"
              hint="Minuscules, pas d'espaces. Ex: riz, huile, lait_bebe"
              error={errors.id?.message}
              {...register('id')}
            />
            <Input
              label="Ordre d'affichage"
              type="number"
              placeholder="0"
              {...register('sortOrder', { valueAsNumber: true })}
            />
          </div>
          {apiError && <Alert variant="danger">{apiError}</Alert>}
          <ModalActions>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>Ajouter</Button>
          </ModalActions>
        </form>
      </Modal>

      {/* Modal supprimer */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer cette catégorie ?" danger size="sm">
        <p className="text-sm text-text-mid mb-4">
          Cette action est irréversible. Impossible de supprimer une catégorie utilisée par des produits.
        </p>
        <ModalActions>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>
            Supprimer
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}