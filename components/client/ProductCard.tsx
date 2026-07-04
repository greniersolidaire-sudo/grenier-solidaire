'use client';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { formatPrice } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  unit: string;
  category: string;
  bgColor: string;
  emoji: string;
  imageUrl?: string | null;
  detailQty: string;
  detailPrice: number;
  grosQty: string;
  grosPrice: number;
  grosThreshold: number;
};

export default function ProductCard({ product }: { product: Product }) {
  const { cart, addItem, updateQty } = useCart();
  const inCart = !!cart[product.id];
  const qty = inCart ? cart[product.id].qty : 0;

  const getTier = (q: number) => q >= product.grosThreshold ? 'gros' : 'detail';
  const getPrice = (q: number) => getTier(q) === 'gros' ? product.grosPrice : product.detailPrice;

  const tier = getTier(Math.max(qty, 1));
  const price = getPrice(Math.max(qty, 1));
  const remaining = product.grosThreshold - (qty || 1);
  const progressPct = Math.min(100, Math.round(((qty || 1) / product.grosThreshold) * 100));
  const unitWord = product.unit.split(' ')[0];

  const handleActivate = () => {
    addItem({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      qty: 1,
      price: product.detailPrice,
      tier: 'detail',
      imageUrl: product.imageUrl || undefined,
    });
  };

  const handleChangeQty = (delta: number) => {
    const newQty = (qty || 0) + delta;
    if (newQty <= 0) {
      updateQty(product.id, 0);
      return;
    }
    const newTier = getTier(newQty);
    const newPrice = getPrice(newQty);
    addItem({
      productId: product.id,
      name: product.name,
      unit: product.unit,
      qty: newQty,
      price: newPrice,
      tier: newTier,
      imageUrl: product.imageUrl || undefined,
    });
  };

  return (
    <div className="bg-white rounded-[20px] border border-border overflow-hidden hover:border-green-soft hover:shadow-md transition-all">
      {/* Image produit */}
      <div
        className="w-full h-[140px] flex items-center justify-center text-[52px] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${product.bgColor}, ${product.bgColor}cc)` }}
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="relative z-10">{product.emoji}</span>
        )}
      </div>

      <div className="p-3.5">
        <div className="text-[15px] font-medium text-text mb-0.5 leading-tight">{product.name}</div>
        <div className="text-xs text-text-light mb-3">{product.unit}</div>

        {/* Prix détail / gros */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-text-mid">Détail</span>
              <span className="text-xs text-text-light">{product.detailQty}</span>
            </div>
            <span className="text-sm font-medium text-text">{formatPrice(product.detailPrice)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-text-mid">Gros</span>
              <span className="text-xs text-text-light">{product.grosQty}</span>
            </div>
            <span className="text-sm font-medium text-green">{formatPrice(product.grosPrice)}</span>
          </div>
        </div>

        {/* Bouton Acheter / sélecteur qty */}
        <div className="flex items-center gap-2 mb-2">
          {!inCart ? (
            <button
              onClick={handleActivate}
              className="flex-1 bg-green text-white rounded-full py-2.5 text-[13px] font-medium hover:bg-green-mid transition-colors"
            >
              Acheter
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-green rounded-full overflow-hidden">
              <button onClick={() => handleChangeQty(-1)} className="w-10 h-9 text-white text-xl flex items-center justify-center hover:bg-white/15 transition-colors">−</button>
              <span className="text-white text-[15px] font-medium min-w-[24px] text-center">{qty}</span>
              <button onClick={() => handleChangeQty(1)} className="w-10 h-9 text-white text-xl flex items-center justify-center hover:bg-white/15 transition-colors">+</button>
            </div>
          )}
        </div>

        {/* Sous-total */}
        {inCart && (
          <div className="bg-green-xpale rounded-[10px] px-3 py-2 flex items-center justify-between text-[13px] mb-2.5">
            <span className="text-text-mid">Sous-total</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-green-soft bg-green-pale px-2 py-0.5 rounded-full">
                {tier === 'gros' ? 'Gros' : 'Détail'}
              </span>
              <span className="font-serif text-lg text-green">{formatPrice(price * qty)}</span>
            </div>
          </div>
        )}

        {/* Barre seuil gros */}
        {inCart && (
          <div>
            <div className={`text-xs font-medium mb-1.5 ${tier === 'gros' ? 'text-green' : 'text-ocre'}`}>
              {tier === 'gros'
                ? 'Prix gros appliqué !'
                : `Plus que ${remaining} ${unitWord}${remaining > 1 ? 's' : ''} pour le prix gros`}
            </div>
            <div className="h-[5px] bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${tier === 'gros' ? 'bg-green' : 'bg-ocre'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
