'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/client/ProductCard';
import { useCart } from '@/lib/CartContext';
import { formatPrice } from '@/lib/utils';

type Product = {
  id: string; name: string; unit: string; category: string;
  bgColor: string; emoji: string; imageUrl?: string | null;
  detailQty: string; detailPrice: number;
  grosQty: string; grosPrice: number; grosThreshold: number;
  active: boolean;
  categoryId: string;
};

type Category = { id: string; label: string };

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const { count, total } = useCart();

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ])
      .then(([pData, cData]) => {
        setProducts(pData.products || []);
        setCategories(cData.categories || []);
      })
      .catch(() => setError('Erreur de chargement du catalogue'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const matchCat = category === 'all' || p.categoryId === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.active;
  }), [products, category, search]);

  return (
    <div>
      {/* Hero */}
      <div className="bg-green px-4 sm:px-5 py-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/80 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
            Cycle ouvert · Commandes jusqu&apos;au vendredi 23h59
          </div>
          <h1 className="font-serif text-[clamp(24px,5vw,38px)] text-white mb-1 leading-tight">Notre catalogue</h1>
          <p className="text-sm text-white/60 font-light">Prix de gros et détail sur vos produits du quotidien</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-border px-4 sm:px-5 py-3 sticky top-[56px] z-40">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-2.5">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-full px-4 py-2.5">
            <span className="text-text-light">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un produit…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-text-light"
            />
            {search && <button onClick={() => setSearch('')} className="text-text-light">✕</button>}
          </div>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[13px] border transition-all flex-shrink-0 ${
                  category === cat.id ? 'bg-green text-white border-green' : 'bg-bg text-text-mid border-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille */}
      <div className="max-w-[1100px] mx-auto p-4 sm:p-5 pb-24">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] border border-border overflow-hidden animate-pulse">
                <div className="h-[140px] bg-green-xpale" />
                <div className="p-4 flex flex-col gap-2.5">
                  <div className="h-4 bg-border rounded-full w-2/3" />
                  <div className="h-3 bg-border rounded-full w-1/2" />
                  <div className="h-9 bg-border rounded-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <div className="text-[40px] mb-3">⚠️</div>
            <p className="text-text-mid mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-green text-white rounded-full px-5 py-2 text-sm">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12 text-text-light">
            <div className="text-[40px] opacity-30 mb-2.5">🔍</div>
            {search ? `Aucun résultat pour "${search}"` : 'Aucun produit disponible pour le moment.'}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {/* Barre mobile */}
      {count > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-border px-4 py-3 pb-6">
          <div className="flex items-center justify-between gap-3.5">
            <div>
              <div className="text-[11px] text-text-light">Mon grenier · {count} article{count > 1 ? 's' : ''}</div>
              <div className="font-serif text-xl text-green">{formatPrice(total)}</div>
            </div>
            <Link href="/checkout" className="bg-green text-white rounded-full px-5 py-3 text-sm font-medium whitespace-nowrap">
              Commander →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
