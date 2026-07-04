
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice, formatDateTime } from '@/lib/utils';

type OrderData = {
  orderNumber: string;
  clientName: string;
  total: number;
  createdAt: string;
  delivery: { mode: string; collectionPoint?: { name: string } | null; address?: string | null };
  items: { product: { name: string }; qty: number; price: number; tier: string }[];
};

export default function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => setOrder(d.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-20 text-text-light animate-pulse">Chargement…</div>;
  }

  if (!order) {
    return (
      <div className="max-w-[400px] mx-auto px-5 py-16 text-center">
        <p className="text-text-mid mb-4">Commande introuvable.</p>
        <Link href="/" className="text-green underline">Retour au catalogue</Link>
      </div>
    );
  }

  const locationLabel = order.delivery?.mode === 'COLLECTE'
    ? order.delivery?.collectionPoint?.name
    : order.delivery?.address;

  const shareWhatsApp = () => {
    const lignes = order.items.map(i => `• ${i.product.name} ×${i.qty} → ${formatPrice(i.price * i.qty)}`).join('\n');
    const msg = `🌿 *GRENIER SOLIDAIRE*\n📄 ${order.orderNumber}\n\n*Client :* ${order.clientName}\n📍 ${locationLabel}\n\n${lignes}\n\n*TOTAL : ${formatPrice(order.total)}*\n\nMerci pour votre commande !`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-[540px] mx-auto px-4 py-10 pb-16 text-center">
      <div className="w-[72px] h-[72px] rounded-full bg-green flex items-center justify-center text-3xl text-white mx-auto mb-5">✓</div>
      <h1 className="font-serif text-[clamp(26px,5vw,36px)] text-green mb-2">Commande confirmée !</h1>
      <p className="text-[15px] text-text-mid leading-relaxed mb-5 font-light">
        Votre paiement a été reçu. Voici le récapitulatif de votre commande.
      </p>
      <div className="font-serif text-lg text-green bg-green-pale px-5 py-2 rounded-full inline-block mb-5">
        {order.orderNumber}
      </div>

      <div className="bg-white rounded-[20px] border border-border p-5 text-left mb-4 w-full">
        <InfoRow label="Client" value={order.clientName} />
        <InfoRow label="Montant" value={formatPrice(order.total)} green />
        <InfoRow label="Récupération" value={locationLabel || '—'} />
        <InfoRow label="Date" value={formatDateTime(order.createdAt)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mb-3">
        <button onClick={shareWhatsApp} className="bg-[#25D366] text-white rounded-full py-3 text-sm font-medium">
          Envoyer par WhatsApp
        </button>
        <button onClick={() => window.print()} className="bg-green text-white rounded-full py-3 text-sm font-medium">
          Télécharger la facture
        </button>
      </div>

      <Link href="/" className="inline-block bg-transparent text-text-mid border border-border rounded-full px-6 py-3 text-sm hover:border-green hover:text-green transition-colors mt-2">
        Retour au catalogue
      </Link>

      <div className="mt-4">
        <Link href="/remboursement" className="text-xs text-text-light underline">Politique de remboursement</Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-green-xpale last:border-b-0 text-sm">
      <span className="text-text-light text-xs min-w-[100px]">{label}</span>
      <span className={`font-medium ${green ? 'text-green' : 'text-text'}`}>{value}</span>
    </div>
  );
}
