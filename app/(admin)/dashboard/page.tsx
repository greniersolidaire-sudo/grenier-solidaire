/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { getActiveCycle, formatPrice, formatDateTime } from '@/lib/utils';
import { Topbar } from '@/components/admin/Topbar';
import { MetricCard, Card, CardHeader, Alert } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [cycle, totalOrders, pendingOrders, paidOrders, totalRevenue, recentOrders, topProducts] =
    await Promise.all([
      getActiveCycle(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PAID' } }),
      prisma.order.aggregate({ where: { status: { in: ['PAID', 'READY', 'DELIVERED'] } }, _sum: { total: true } }),
      prisma.order.findMany({
        take: 6, orderBy: { createdAt: 'desc' },
        include: { client: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { subtotal: true, qty: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 5,
      }),
    ]);

  const revenueValue = totalRevenue._sum.total || 0;

  const topProductsWithNames = await Promise.all(
    topProducts.map(async (tp: any) => {
      const product = await prisma.product.findUnique({ where: { id: tp.productId } });
      return { ...tp, name: product?.name || 'Inconnu' };
    })
  );

  const logs = await prisma.auditLog.findMany({
    take: 5, orderBy: { createdAt: 'desc' },
    include: { admin: { select: { name: true } } },
  });

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'En attente', PAID: 'Payée', READY: 'Prête', DELIVERED: 'Livrée',
    CANCELLED: 'Annulée', FAILED: 'Échec',
  };
  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'text-ocre', PAID: 'text-green-mid', READY: 'text-blue-700',
    DELIVERED: 'text-text-light', CANCELLED: 'text-red-600', FAILED: 'text-red-600',
  };

  return (
    <div>
      <Topbar title="Tableau de bord" subtitle={cycle ? `Cycle : ${cycle.label}` : 'Aucun cycle actif'} />
      <div className="p-6">

        {pendingOrders > 0 && (
          <Alert variant="warning">
            <strong>{pendingOrders} commande{pendingOrders > 1 ? 's' : ''}</strong> en attente de paiement.
          </Alert>
        )}

        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Commandes totales" value={totalOrders} sub={`${pendingOrders} en attente`} subColor="text-ocre" />
          <MetricCard label="Paiements confirmés" value={paidOrders} sub="Ce cycle" subColor="text-[#27AE60]" />
          <MetricCard label="Chiffre d'affaires" value={`${Math.round(revenueValue / 1000)}k`} sub="FCFA confirmés" />
          <MetricCard label="Cycle statut" value={cycle?.status === 'OPEN' ? 'Ouvert' : 'Fermé'} subColor={cycle?.status === 'OPEN' ? 'text-[#27AE60]' : 'text-red-600'} />
        </div>

        {/* Commandes récentes + Top produits */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-4">
          <Card>
            <CardHeader title="Commandes récentes" />
            <div className="divide-y divide-bg">
              {recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-xs font-medium text-green-soft font-mono">{o.orderNumber}</div>
                    <div className="text-[13px] font-medium text-text">{o.client.name}</div>
                    <div className="text-[11px] text-text-light">{formatDateTime(o.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatPrice(o.total)}</div>
                    <div className={`text-[11px] font-medium ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Top produits" />
            <div className="divide-y divide-bg">
              {topProductsWithNames.map(p => (
                <div key={p.productId} className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-text-mid">{p.name}</span>
                  <span className="text-[13px] font-medium text-green">{formatPrice(p._sum.subtotal || 0)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Journal activité récente */}
        <Card>
          <CardHeader title="Activité récente" subtitle="Journal des dernières actions admin" />
          <div className="divide-y divide-bg">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-soft mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-text">{log.action.replace(/_/g, ' ')} · <span className="text-text-light">{log.target}</span></div>
                  <div className="text-[10px] text-text-light mt-0.5">{log.admin?.name} · {formatDateTime(log.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
