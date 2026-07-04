'use client';
import { useState, useEffect, useCallback } from 'react';
import { Topbar } from '@/components/admin/Topbar';
import { Button } from '@/components/ui/Button';
import { Badge, ORDER_STATUS_BADGE, Card, Alert } from '@/components/ui/Badge';
import { DataTable, TableAction, FilterTabs } from '@/components/ui/DataTable';
import { Modal, ModalActions } from '@/components/ui/Modal';
import { formatPrice, formatDateTime } from '@/lib/utils';

type Order = {
  id: string; orderNumber: string; total: number; status: string; createdAt: string;
  client: { name: string; phone: string };
  delivery: { mode: string; collectionPoint?: { name: string } | null; address?: string | null };
  items: { product: { name: string }; qty: number; price: number; tier: string }[];
  transaction?: { status: string; hmacVerified: boolean } | null;
};

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'PAID', label: 'Payée' },
  { value: 'READY', label: 'Prête à collecter' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' },
];

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdating(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Erreur lors de la mise à jour');
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUpdating(false);
    }
  };

  const exportOrders = () => {
    const csv = [
      ['N° Commande', 'Client', 'Téléphone', 'Montant', 'Statut', 'Livraison', 'Date'],
      ...orders.map(o => [
        o.orderNumber, o.client.name, o.client.phone,
        o.total, o.status,
        o.delivery?.mode === 'COLLECTE' ? o.delivery?.collectionPoint?.name : o.delivery?.address,
        formatDateTime(o.createdAt),
      ]),
    ].map(row => row.join(';')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `commandes-${Date.now()}.csv`; a.click();
  };

  const tabs = [
    { id: 'all', label: 'Toutes', count: orders.length },
    ...Object.entries(ORDER_STATUS_BADGE).map(([id, { label }]) => ({
      id, label, count: orders.filter(o => o.status === id).length,
    })),
  ];

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div>
      <Topbar title="Commandes" subtitle={`${orders.length} au total`}>
        <Button variant="secondary" size="sm" onClick={exportOrders}>↓ Export CSV</Button>
      </Topbar>

      <div className="p-6">
        {pendingCount > 0 && (
          <Alert variant="warning">
            <strong>{pendingCount} commande{pendingCount > 1 ? 's' : ''}</strong> en attente de paiement.
          </Alert>
        )}

        <Card>
          <div className="px-4 py-3.5 border-b border-border overflow-x-auto">
            <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
          </div>
          <DataTable
            columns={[
              {
                key: 'orderNumber', label: 'N° commande',
                render: o => <span className="font-mono text-[11px] font-medium text-green-soft">{o.orderNumber}</span>,
              },
              {
                key: 'client', label: 'Client',
                render: o => (
                  <div>
                    <div className="font-medium text-[13px]">{o.client.name}</div>
                    <div className="text-[11px] text-text-light">{o.client.phone}</div>
                  </div>
                ),
              },
              { key: 'total', label: 'Montant', render: o => <span className="font-medium">{formatPrice(o.total)}</span> },
              {
                key: 'status', label: 'Statut',
                render: o => {
                  const s = ORDER_STATUS_BADGE[o.status];
                  return s ? <Badge variant={s.variant}>{s.label}</Badge> : <span>{o.status}</span>;
                },
              },
              {
                key: 'delivery', label: 'Livraison',
                render: o => (
                  <div className="text-xs text-text-light">
                    <div>{o.delivery?.mode === 'COLLECTE' ? '📍 Collecte' : '🏠 Domicile'}</div>
                    <div className="truncate max-w-[120px]">
                      {o.delivery?.mode === 'COLLECTE' ? o.delivery?.collectionPoint?.name : o.delivery?.address}
                    </div>
                  </div>
                ),
              },
              {
                key: 'transaction', label: 'Paiement',
                render: o => o.transaction ? (
                  <Badge variant={o.transaction.hmacVerified ? 'success' : 'warning'}>
                    {o.transaction.hmacVerified ? 'Wave ✓' : 'Non vérifié'}
                  </Badge>
                ) : <span className="text-text-light text-xs">—</span>,
              },
              { key: 'createdAt', label: 'Date', render: o => <span className="text-[11px] text-text-light">{formatDateTime(o.createdAt)}</span> },
              {
                key: 'actions', label: 'Actions',
                render: o => (
                  <div className="flex gap-1">
                    <TableAction
                      onClick={() => { setSelectedOrder(o); setNewStatus(o.status); }}
                      title="Modifier le statut"
                    >
                      ✎
                    </TableAction>
                    <TableAction
                      onClick={() => {
                        const msg = `Bonjour ${o.client.name}, votre commande ${o.orderNumber} est ${ORDER_STATUS_BADGE[o.status]?.label?.toLowerCase() || o.status}. Total : ${formatPrice(o.total)}`;
                        window.open(`https://wa.me/${o.client.phone.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      title="Envoyer WhatsApp"
                    >
                      💬
                    </TableAction>
                  </div>
                ),
              },
            ]}
            data={orders}
            keyField="id"
            loading={loading}
            emptyMessage="Aucune commande"
          />
        </Card>
      </div>

      {/* Modal modifier statut */}
      <Modal
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Commande ${selectedOrder?.orderNumber}`}
        subtitle={`Client : ${selectedOrder?.client.name}`}
        size="sm"
      >
        {selectedOrder && (
          <>
            <div className="mb-4">
              <div className="text-[11px] font-medium uppercase tracking-wide text-text-light mb-1.5">Articles</div>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-bg last:border-0">
                  <span>{item.product.name} ×{item.qty}</span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between font-medium pt-2 text-sm">
                <span>Total</span>
                <span className="text-green">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-medium uppercase tracking-wide text-text-light mb-1.5">
                Changer le statut
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3.5 py-3 border border-border rounded-[10px] text-sm outline-none focus:border-green"
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <ModalActions>
              <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Fermer</Button>
              <Button loading={updating} onClick={handleStatusUpdate}>Enregistrer</Button>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  );
}
