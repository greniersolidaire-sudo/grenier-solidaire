'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductInput } from '@/lib/validations';
import { Topbar } from '@/components/admin/Topbar';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal, ModalActions, ModalDangerBox } from '@/components/ui/Modal';
import { Badge, Card, CardHeader, Alert } from '@/components/ui/Badge';
import { DataTable, TableAction, FilterTabs } from '@/components/ui/DataTable';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

type Product = {
  id: string; name: string; unit: string; categoryId: string;
  bgColor: string; emoji: string; imageUrl?: string | null;
  detailQty: string; detailPrice: number;
  grosQty: string; grosPrice: number; grosThreshold: number;
  active: boolean; createdAt: string;
  category: { id: string; label: string };
};

type Category = { id: string; label: string };

const CAT_DEFAULTS: Record<string, { bg: string; emoji: string }> = {
  huile:   { bg: '#E8F5E9', emoji: '🫙' },
  riz:     { bg: '#FFFDE7', emoji: '🌾' },
  lait:    { bg: '#E3F2FD', emoji: '🥛' },
  hygiene: { bg: '#F3E5F5', emoji: '🧼' },
  tomate:  { bg: '#FFEBEE', emoji: '🍅' },
};

export default function ProduitsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { categoryId: 'huile', bgColor: '#E8F5E9', emoji: '🫙', active: true },
  });

  const watchCategory = watch('categoryId');

  // Auto-remplir bg et emoji selon la catégorie
  useEffect(() => {
    const defaults = CAT_DEFAULTS[watchCategory];
    if (defaults && !editProduct) {
      setValue('bgColor', defaults.bg);
      setValue('emoji', defaults.emoji);
    }
  }, [watchCategory, editProduct, setValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories'),
      ]);
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
      setProducts(pData.products || []);
      setCategories((cData.categories || []).filter((c: Category) => c.id !== 'all'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditProduct(null);
    setPreviewUrl(null);
    reset({ categoryId: 'huile', bgColor: '#E8F5E9', emoji: '🫙', active: true });
    setApiError('');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setPreviewUrl(p.imageUrl || null);
    reset({
      name: p.name, unit: p.unit, categoryId: p.categoryId,
      bgColor: p.bgColor, emoji: p.emoji,
      detailQty: p.detailQty, detailPrice: p.detailPrice,
      grosQty: p.grosQty, grosPrice: p.grosPrice,
      grosThreshold: p.grosThreshold, active: p.active,
    });
    setApiError('');
    setShowModal(true);
  };

  const onSubmit = async (data: ProductInput) => {
    setSaving(true);
    setApiError('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));
      const imageFile = imageRef.current?.files?.[0];
      if (imageFile) formData.append('image', imageFile);

      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');

      setShowModal(false);
      fetchData();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchData();
  };

  const filtered = products.filter(p =>
    filter === 'all' ? true : filter === 'active' ? p.active : !p.active
  );

  const tabs = [
    { id: 'all', label: 'Tous', count: products.length },
    { id: 'active', label: 'Actifs', count: products.filter(p => p.active).length },
    { id: 'inactive', label: 'Inactifs', count: products.filter(p => !p.active).length },
  ];

  return (
    <div>
      <Topbar title="Catalogue produits" subtitle={`${products.length} produit${products.length > 1 ? 's' : ''}`}>
        <Button onClick={openAdd} size="sm">+ Ajouter un produit</Button>
      </Topbar>

      <div className="p-6">
        {apiError && !showModal && <Alert variant="danger">{apiError}</Alert>}

        <Card>
          <div className="px-4 py-3.5 border-b border-border">
            <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
          </div>
          <DataTable
            columns={[
              {
                key: 'name', label: 'Produit',
                render: p => (
                  <div className="flex items-center gap-3">
                    {p.imageUrl ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" style={{ background: p.bgColor }}>
                        {p.emoji}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-[13px]">{p.name}</div>
                      <div className="text-[11px] text-text-light">{p.unit}</div>
                    </div>
                  </div>
                ),
              },
              { key: 'category', label: 'Catégorie', render: p => <span className="text-xs text-text-light">{p.category.label}</span> },
              { key: 'detailPrice', label: 'Prix détail', render: p => formatPrice(p.detailPrice) },
              { key: 'grosPrice', label: 'Prix gros', render: p => <span className="font-medium text-green">{formatPrice(p.grosPrice)}</span> },
              { key: 'grosThreshold', label: 'Seuil', render: p => <span className="text-xs">{p.grosThreshold} unités</span> },
              {
                key: 'active', label: 'Statut',
                render: p => <Badge variant={p.active ? 'success' : 'danger'}>{p.active ? 'Actif' : 'Inactif'}</Badge>,
              },
              {
                key: 'actions', label: 'Actions',
                render: p => (
                  <div className="flex gap-1">
                    <TableAction onClick={() => openEdit(p)} title="Modifier">✎</TableAction>
                    <TableAction onClick={() => handleToggle(p)} title={p.active ? 'Désactiver' : 'Activer'} variant={p.active ? 'danger' : 'success'}>
                      {p.active ? '✕' : '✓'}
                    </TableAction>
                    <TableAction onClick={() => setDeleteId(p.id)} title="Supprimer" variant="danger">🗑</TableAction>
                  </div>
                ),
              },
            ]}
            data={filtered}
            keyField="id"
            loading={loading}
            emptyMessage="Aucun produit trouvé"
          />
        </Card>
      </div>

      {/* Modal Ajouter/Modifier */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editProduct ? `Modifier — ${editProduct.name}` : 'Ajouter un produit'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="sm:col-span-2">
              <Input label="Nom du produit *" placeholder="Ex: Huile Dinor" error={errors.name?.message} {...register('name')} />
            </div>
            <div className="sm:col-span-2">
              <Input label="Conditionnement *" placeholder="Ex: Carton 12 bouteilles (1L)" error={errors.unit?.message} {...register('unit')} />
            </div>
            <Select label="Catégorie *" error={errors.categoryId?.message} {...register('categoryId')}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
            <Input label="Libellé qté détail *" placeholder="1 carton" error={errors.detailQty?.message} {...register('detailQty')} />
            <Input label="Prix détail (FCFA) *" type="number" placeholder="14500" error={errors.detailPrice?.message} {...register('detailPrice', { valueAsNumber: true })} />
            <Input label="Libellé qté gros *" placeholder="5 cartons+" error={errors.grosQty?.message} {...register('grosQty')} />
            <Input label="Prix gros (FCFA) *" type="number" placeholder="12800" error={errors.grosPrice?.message} {...register('grosPrice', { valueAsNumber: true })} />
            <Input label="Seuil gros (unités) *" type="number" placeholder="5" error={errors.grosThreshold?.message} {...register('grosThreshold', { valueAsNumber: true })} />

            {/* Image upload */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium uppercase tracking-wide text-text-light mb-1.5">
                Image produit
              </label>
              <div className="flex items-center gap-3">
                {previewUrl && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                    <Image src={previewUrl} alt="Aperçu" width={64} height={64} className="object-cover w-full h-full" />
                  </div>
                )}
                <div>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setPreviewUrl(URL.createObjectURL(file));
                    }}
                    className="hidden"
                    id="imageUpload"
                  />
                  <label
                    htmlFor="imageUpload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full text-sm text-text-mid hover:border-green hover:text-green transition-colors"
                  >
                    📷 {previewUrl ? 'Changer l\'image' : 'Choisir une image'}
                  </label>
                  <p className="text-[11px] text-text-light mt-1">JPG, PNG ou WebP · max 2 Mo</p>
                </div>
              </div>
            </div>
          </div>

          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <ModalActions>
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>
              {editProduct ? 'Modifier le produit' : 'Ajouter le produit'}
            </Button>
          </ModalActions>
        </form>
      </Modal>

      {/* Modal confirmation suppression */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Supprimer ce produit ?" danger size="sm">
        <ModalDangerBox>
          ⚠ Cette action est irréversible. Pour masquer temporairement, utilise plutôt &quot;Désactiver&quot;.
        </ModalDangerBox>
        <ModalActions>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Annuler</Button>
          <Button variant="danger" onClick={() => deleteId && handleDelete(deleteId)}>
            Supprimer définitivement
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
