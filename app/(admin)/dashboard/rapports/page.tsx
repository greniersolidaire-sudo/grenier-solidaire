/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { Topbar } from '@/components/admin/Topbar';
import { Card, CardHeader, MetricCard } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function RapportsPage() {
  const [ordersByStatus, topProducts, clientStats, revenueByMonth] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true }, _sum: { total: true } }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { subtotal: true, qty: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 10,
    }),
    prisma.client.aggregate({ _count: { _all: true }, _sum: { totalSpent: true, ordersCount: true } }),
    prisma.order.findMany({
      where: { status: { in: ['PAID', 'READY', 'DELIVERED'] } },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const topProductsWithNames = await Promise.all(
    topProducts.map(async (tp: any) => {
      const p = await prisma.product.findUnique({ where: { id: tp.productId }, select: { name: true } });
      return { ...tp, name: p?.name || 'Inconnu' };
    })
  );

  const totalRevenue = ordersByStatus
    .filter((o: any) => ['PAID', 'READY', 'DELIVERED'].includes(o.status))
    .reduce((s: number, o: any) => s + (o._sum.total || 0), 0);

  const exportCSV = async () => { 'use server'; };

  return (
    <div>
      <Topbar title="Rapports & Statistiques" />
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MetricCard label="Total clients" value={clientStats._count._all} sub="Inscrits" />
          <MetricCard label="Total commandes" value={ordersByStatus.reduce((s: number, o: any) => s + o._count._all, 0)} sub="Toutes périodes" />
          <MetricCard label="Chiffre d'affaires" value={`${Math.round(totalRevenue / 1000)}k`} sub="FCFA confirmés" subColor="text-[#27AE60]" />
          <MetricCard label="Panier moyen" value={formatPrice(clientStats._sum.ordersCount ? Math.round(totalRevenue / clientStats._sum.ordersCount) : 0)} sub="Par commande" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Répartition par statut */}
          <Card>
            <CardHeader title="Commandes par statut" />
            <div className="p-4">
              {ordersByStatus.map((o: any) => (
                <div key={o.status} className="flex items-center justify-between py-2.5 border-b border-bg last:border-0">
                  <span className="text-sm text-text-mid capitalize">{o.status.replace(/_/g, ' ').toLowerCase()}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{o._count._all} commandes</div>
                    <div className="text-[11px] text-text-light">{formatPrice(o._sum.total || 0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top produits */}
          <Card>
            <CardHeader title="Top 10 produits" subtitle="Par chiffre d'affaires" />
            <div className="p-4">
              {topProductsWithNames.map((p: any, i: number) => (
                <div key={p.productId} className="flex items-center gap-3 py-2.5 border-b border-bg last:border-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${i < 3 ? 'bg-green' : 'bg-green-soft'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-[11px] text-text-light">{p._sum.qty || 0} unités vendues</div>
                  </div>
                  <div className="text-sm font-medium text-green flex-shrink-0">{formatPrice(p._sum.subtotal || 0)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export */}
        <Card className="mt-4">
          <CardHeader title="Exports" subtitle="Télécharger les données" />
          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: '📊 Commandes CSV', desc: 'Toutes les commandes' },
              { label: '💰 Paiements CSV', desc: 'Transactions Wave' },
              { label: '👥 Clients CSV', desc: 'Base clients complète' },
            ].map(item => (
              <button
                key={item.label}
                className="border border-border rounded-xl p-4 text-left hover:border-green transition-colors"
                onClick={() => alert('Export disponible après connexion à la vraie BDD')}
              >
                <div className="text-sm font-medium text-text">{item.label}</div>
                <div className="text-xs text-text-light mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
