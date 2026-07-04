'use client';
import { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/admin/Topbar';
import { Badge, DELIVERY_STATUS_BADGE, Card, Alert } from '@/components/ui/Badge';
import { DataTable, TableAction, FilterTabs } from '@/components/ui/DataTable';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDateTime } from '@/lib/utils';

type Delivery = {
  id: string; mode: string; status: string; deliveryFee: number;
  scheduledAt?: string | null; deliveredAt?: string | null;
  address?: string | null; zone?: string | null;
  collectionPoint?: { name: string } | null;
  order: {
    id: string; orderNumber: string; total: number;
    client: { name: string; phone: string };
  };
};

const DELIVERY_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'SCHEDULED', label: 'Planifiée' },
  { value: 'IN_TRANSIT', label: 'En route' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'FAILED', label: 'Échec' },
];

export default function LivraisonsPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deliveries');
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const handleUpdate = async () => {
    if (!selected || !newStatus) return;
    setUpdating(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${selected.order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur');
      setSelected(null);
      fetchDeliveries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = deliveries.filter(d => filter === 'all' || d.status === filter);

  const tabs = [
    { id: 'all', label: 'Toutes', count: deliveries.length },
    ...Object.entries(DELIVERY_STATUS_BADGE).map(([id, { label }]) => ({
      id, label, count: deliveries.filter(d => d.status === id).length,
    })),
  ];

  return (
    <div>
      <Topbar title="Livraisons" subtitle={`${deliveries.length} livraisons`} />
      <div className="p-6">
        <Card>
          <div className="px-4 py-3.5 border-b border-border overflow-x-auto">
            <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
          </div>
          <DataTable
            columns={[
              {
                key: 'order', label: 'Commande',
                render: d => (
                  <div>
                    <div className="font-mono text-[11px] font-medium text-green-soft">{d.order.orderNumber}</div>
                    <div className="font-medium text-[13px]">{d.order.client.name}</div>
                    <div className="text-[11px] text-text-light">{d.order.client.phone}</div>
                  </div>
                ),
              },
              {
                key: 'mode', label: 'Mode',
                render: d => (
                  <div>
                    <div className="font-medium text-xs">{d.mode === 'COLLECTE' ? '📍 Collecte' : '🏠 Domicile'}</div>
                    <div className="text-[11px] text-text-light truncate max-w-[140px]">
                      {d.mode === 'COLLECTE' ? d.collectionPoint?.name : d.address}
                    </div>
                  </div>
                ),
              },
              {
                key: 'status', label: 'Statut',
                render: d => {
                  const s = DELIVERY_STATUS_BADGE[d.status];
                  return s ? <Badge variant={s.variant}>{s.label}</Badge> : <span>{d.status}</span>;
                },
              },
              {
                key: 'deliveryFee', label: 'Frais',
                render: d => <span className="text-xs">{d.deliveryFee > 0 ? formatPrice(d.deliveryFee) : 'Gratuit'}</span>,
              },
              {
                key: 'scheduledAt', label: 'Date prévue',
                render: d => <span className="text-[11px] text-text-light">{d.scheduledAt ? formatDateTime(d.scheduledAt) : '—'}</span>,
              },
              {
                key: 'actions', label: 'Actions',
                render: d => (
                  <div className="flex gap-1">
                    <TableAction
                      onClick={() => { setSelected(d); setNewStatus(d.status); }}
                      title="Modifier statut"
                    >
                      ✎
                    </TableAction>
                    <TableAction
                      onClick={() => {
                        const msg = `Bonjour ${d.order.client.name}, mise à jour de votre livraison ${d.order.orderNumber} : ${DELIVERY_STATUS_BADGE[d.status]?.label}`;
                        window.open(`https://wa.me/${d.order.client.phone.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      title="Notifier WhatsApp"
                    >
                      💬
                    </TableAction>
                  </div>
                ),
              },
            ]}
            data={filtered}
            keyField="id"
            loading={loading}
            emptyMessage="Aucune livraison"
          />
        </Card>
      </div>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Livraison — ${selected?.order.orderNumber}`}
        size="sm"
      >
        {selected && (
          <>
            <div className="mb-4 text-sm text-text-mid space-y-1.5">
              <div><strong>Client :</strong> {selected.order.client.name}</div>
              <div><strong>Mode :</strong> {selected.mode === 'COLLECTE' ? 'Point de collecte' : 'Domicile'}</div>
              <div><strong>Lieu :</strong> {selected.mode === 'COLLECTE' ? selected.collectionPoint?.name : selected.address}</div>
              {selected.zone && <div><strong>Zone :</strong> {selected.zone}</div>}
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-medium uppercase tracking-wide text-text-light mb-1.5">
                Nouveau statut
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-3 border border-border rounded-[10px] text-sm outline-none focus:border-green"
              >
                {DELIVERY_STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <ModalActions>
              <Button variant="secondary" onClick={() => setSelected(null)}>Annuler</Button>
              <Button loading={updating} onClick={handleUpdate}>Enregistrer</Button>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  );
}
