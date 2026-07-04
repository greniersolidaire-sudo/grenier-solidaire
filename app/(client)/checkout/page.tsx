'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/lib/CartContext';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

const checkoutSchema = z.object({
  clientName: z.string().min(2, 'Prénom requis'),
  clientPhone: z.string().min(8, 'Numéro invalide'),
  clientQuartier: z.string().optional(),
  deliveryMode: z.enum(['COLLECTE', 'DOMICILE']),
  collectionPointId: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryZone: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

type CollectionPoint = { id: string; name: string; zone: string };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [points, setPoints] = useState<CollectionPoint[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryMode: 'COLLECTE' },
  });

  const deliveryMode = watch('deliveryMode');

  useEffect(() => {
    fetch('/api/collection-points').then(r => r.json()).then(d => setPoints(d.points || []));
  }, []);

  if (count === 0) {
    return (
      <div className="max-w-[400px] mx-auto px-5 py-16 text-center">
        <div className="w-[72px] h-[72px] rounded-full bg-green-xpale flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">🛒</span>
        </div>
        <div className="font-serif text-2xl text-green mb-2">Votre grenier est vide</div>
        <p className="text-sm text-text-mid leading-relaxed mb-7 font-light">Parcourez notre catalogue et ajoutez vos articles.</p>
        <Link href="/" className="inline-block w-full bg-green text-white rounded-full py-3.5 text-[15px] font-medium text-center">
          Voir le catalogue
        </Link>
      </div>
    );
  }

  const onSubmit = async (formData: CheckoutForm) => {
    if (step === 1) { setStep(2); return; }
    setSubmitting(true);
    setApiError('');

    try {
      // 1. Créer la commande
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(i => ({
            productId: i.productId,
            qty: i.qty,
            price: i.price,
            tier: i.tier,
          })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Erreur lors de la commande');

      const { order } = orderData;

      // 2. Créer la session Wave
      const waveRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const waveData = await waveRes.json();
      if (!waveRes.ok) throw new Error(waveData.error || 'Erreur paiement');

      // 3. Sauvegarder les infos pour la page de confirmation
      sessionStorage.setItem('gs_last_order', JSON.stringify({
        orderId: order.id,
        orderNumber: order.orderNumber,
        clientName: formData.clientName,
        total,
      }));

      clearCart();

      // 4. Rediriger vers Wave
      window.location.href = waveData.waveLaunchUrl;
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-5 py-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-text-mid hover:border-green transition-colors">
          ←
        </Link>
        <h1 className="font-serif text-[clamp(20px,4vw,30px)] text-green">Finaliser ma commande</h1>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center mb-6">
        <StepDot num={1} active={step === 1} done={step > 1} label="Mes infos" />
        <div className={`flex-1 h-px mx-2 ${step > 1 ? 'bg-green' : 'bg-border'}`} />
        <StepDot num={2} active={step === 2} done={false} label="Validation" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
          <div>
            {step === 1 && (
              <>
                <Section title="Vos informations">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Prénom *" placeholder="Kouamé" error={errors.clientName?.message} {...register('clientName')} />
                    <Input label="Téléphone WhatsApp *" placeholder="07 XX XX XX XX" error={errors.clientPhone?.message} {...register('clientPhone')} />
                  </div>
                  <Input label="Quartier" placeholder="Cocody, Yopougon…" className="mt-3" {...register('clientQuartier')} />
                </Section>

                <Section title="Mode de récupération">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                    <DeliveryOption
                      label="Point de collecte"
                      desc="Gratuit · samedi matin"
                      active={deliveryMode === 'COLLECTE'}
                      value="COLLECTE"
                      register={register('deliveryMode')}
                    />
                    <DeliveryOption
                      label="Livraison domicile"
                      desc="1 500 F selon zone"
                      active={deliveryMode === 'DOMICILE'}
                      value="DOMICILE"
                      register={register('deliveryMode')}
                    />
                  </div>

                  {deliveryMode === 'COLLECTE' && (
                    <Select label="Point de collecte *" error={errors.collectionPointId?.message} {...register('collectionPointId')}>
                      <option value="">Choisir un point…</option>
                      {points.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  )}

                  {deliveryMode === 'DOMICILE' && (
                    <>
                      <Textarea
                        label="Adresse complète *"
                        placeholder="Rue, quartier, point de repère…"
                        rows={3}
                        error={errors.deliveryAddress?.message}
                        className="mb-3"
                        {...register('deliveryAddress')}
                      />
                      <Input label="Zone / Commune" placeholder="Cocody, Yopougon…" {...register('deliveryZone')} />
                    </>
                  )}
                </Section>

                <Button type="submit" variant="primary" size="lg" full>
                  Voir le récapitulatif →
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-green-xpale rounded-2xl p-3.5 mb-4 flex gap-2.5 text-sm text-text-mid leading-relaxed">
                  <span>🔒</span>
                  <span>Paiement sécurisé via Wave CI. Grenier Solidaire ne stocke jamais vos données bancaires.</span>
                </div>

                <Section title="Récapitulatif commande">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center py-2.5 border-b border-green-xpale last:border-0">
                      <div>
                        <div className="text-[13px] font-medium text-text">{item.name}</div>
                        <div className="text-[11px] text-text-light">Qté {item.qty} · {item.tier === 'gros' ? 'Prix gros' : 'Prix détail'}</div>
                      </div>
                      <span className="text-[13px] font-medium">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                  {deliveryMode === 'DOMICILE' && (
                    <div className="flex justify-between py-2.5 text-sm text-text-mid">
                      <span>Frais de livraison</span>
                      <span>1 500 F</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-3 border-t border-border mt-1">
                    <span className="text-sm text-text-mid">Total à payer</span>
                    <span className="font-serif text-2xl text-green">{formatPrice(total + (deliveryMode === 'DOMICILE' ? 1500 : 0))}</span>
                  </div>
                </Section>

                {apiError && (
                  <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{apiError}</div>
                )}

                <Button type="submit" variant="primary" size="lg" full loading={submitting} className="mb-3">
                  Payer via Wave CI →
                </Button>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-text-mid underline">
                  ← Modifier mes informations
                </button>
              </>
            )}
          </div>

          {/* Résumé commande */}
          <div className="bg-white rounded-[20px] border border-border p-5 sticky top-[140px]">
            <div className="font-serif text-xl text-green mb-3.5">Récapitulatif</div>
            {items.map(item => (
              <div key={item.productId} className="flex justify-between py-2 border-b border-green-xpale last:border-0 text-sm">
                <span className="text-text-mid">{item.name} ×{item.qty}</span>
                <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline pt-3 mt-1">
              <span className="text-sm text-text-mid">Total</span>
              <span className="font-serif text-2xl text-green">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] border border-border p-5 mb-3.5">
      <div className="text-[15px] font-medium text-green mb-4">{title}</div>
      {children}
    </div>
  );
}

function StepDot({ num, active, done, label }: { num: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${active || done ? 'bg-green text-white' : 'bg-green-xpale text-text-light border border-border'}`}>
        {done ? '✓' : num}
      </div>
      <span className={`text-xs ${active ? 'text-green font-medium' : 'text-text-light'}`}>{label}</span>
    </div>
  );
}

function DeliveryOption({ label, desc, active, value, register }: {
  label: string; desc: string; active: boolean; value: string;
  register: ReturnType<typeof useForm>['register'] extends (...args: never[]) => infer R ? R : never;
}) {
  return (
    <label className={`border-[1.5px] rounded-2xl p-3.5 cursor-pointer transition-all ${active ? 'border-green bg-green-xpale' : 'border-border'}`}>
      <input type="radio" value={value} {...register} className="sr-only" />
      <div className={`text-sm font-medium mb-0.5 ${active ? 'text-green' : 'text-text'}`}>{label}</div>
      <div className="text-xs text-text-light">{desc}</div>
    </label>
  );
}
