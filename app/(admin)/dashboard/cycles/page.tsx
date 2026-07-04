'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cycleSchema, CycleInput } from '@/lib/validations';
import { Topbar } from '@/components/admin/Topbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ModalActions, ModalDangerBox } from '@/components/ui/Modal';
import { Badge, Card, CardHeader, MetricCard, Alert } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

type Cycle = {
  id: string; label: string; status: string;
  opensAt: string; closesAt: string; deliveryAt: string;
  _count: { orders: number };
};

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [closeId, setCloseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CycleInput>({
    resolver: zodResolver(cycleSchema),
  });

  const fetchCycles = async () => {
    setLoading(true);
    const res = await fetch('/api/cycles');
    const data = await res.json();
    setCycles(data.cycles || []);
    setLoading(false);
  };

  useEffect(() => { fetchCycles(); }, []);

  const onSubmit = async (data: CycleInput) => {
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erreur');
      setShowNew(false); reset(); fetchCycles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async (id: string) => {
    await fetch(`/api/cycles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close' }),
    });
    setCloseId(null); fetchCycles();
  };

  const activeCycle = cycles.find(c => c.status === 'OPEN');

  return (
    <div>
      <Topbar title="Cycles de commande">
        <Button size="sm" onClick={() => { setShowNew(true); setError(''); reset(); }}>
          + Nouveau cycle
        </Button>
      </Topbar>

      <div className="p-6">
        {activeCycle && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <MetricCard label="Statut" value="Ouvert" subColor="text-[#27AE60]" sub={activeCycle.label} />
            <MetricCard label="Commandes" value={activeCycle._count.orders} sub="Ce cycle" />
            <MetricCard label="Fermeture" value={new Date(activeCycle.closesAt).toLocaleDateString('fr-FR')} sub="Date limite" />
          </div>
        )}

        {!loading && cycles.length === 0 && (
          <Alert variant="info">Aucun cycle créé. Créez votre premier cycle pour ouvrir les commandes.</Alert>
        )}

        <div className="flex flex-col gap-3">
          {cycles.map(cycle => (
            <Card key={cycle.id}>
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[15px] text-text">{cycle.label}</span>
                    <Badge variant={cycle.status === 'OPEN' ? 'success' : 'neutral'}>
                      {cycle.status === 'OPEN' ? 'Ouvert' : 'Fermé'}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-light">
                    Ouverture : {formatDateTime(cycle.opensAt)} · Fermeture : {formatDateTime(cycle.closesAt)}
                  </div>
                  <div className="text-xs text-text-light">
                    Livraison : {formatDateTime(cycle.deliveryAt)} · {cycle._count.orders} commande{cycle._count.orders > 1 ? 's' : ''}
                  </div>
                </div>
                {cycle.status === 'OPEN' && (
                  <Button variant="danger" size="sm" onClick={() => setCloseId(cycle.id)}>
                    Fermer le cycle
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal nouveau cycle */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nouveau cycle" size="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3 mb-4">
            <Input label="Libellé *" placeholder="Ex: Cycle 3–7 juin 2025" error={errors.label?.message} {...register('label')} />
            <Input label="Date d'ouverture *" type="datetime-local" error={errors.opensAt?.message} {...register('opensAt')} />
            <Input label="Date de fermeture *" type="datetime-local" error={errors.closesAt?.message} {...register('closesAt')} />
            <Input label="Date de livraison *" type="datetime-local" error={errors.deliveryAt?.message} {...register('deliveryAt')} />
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <ModalActions>
            <Button type="button" variant="secondary" onClick={() => setShowNew(false)}>Annuler</Button>
            <Button type="submit" loading={saving}>Créer le cycle</Button>
          </ModalActions>
        </form>
      </Modal>

      {/* Modal fermer cycle */}
      <Modal open={!!closeId} onClose={() => setCloseId(null)} title="Fermer le cycle ?" danger size="sm">
        <ModalDangerBox>
          ⚠ Les commandes en attente de paiement seront annulées automatiquement.
          Les commandes payées seront transmises au fournisseur. Action irréversible.
        </ModalDangerBox>
        <ModalActions>
          <Button variant="secondary" onClick={() => setCloseId(null)}>Annuler</Button>
          <Button variant="danger" onClick={() => closeId && handleClose(closeId)}>
            Fermer définitivement
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}
