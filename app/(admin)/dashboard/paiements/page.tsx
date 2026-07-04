/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { Topbar } from '@/components/admin/Topbar';
import { Badge, Card, CardHeader, MetricCard } from '@/components/ui/Badge';
import { formatPrice, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PaiementsPage() {
  const [transactions, stats] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        order: { include: { client: true } },
      },
    }),
    prisma.transaction.groupBy({
      by: ['status'],
      _count: { _all: true },
      _sum: { amount: true },
    }),
  ]);

  const completed = stats.find((s: any) => s.status === 'COMPLETED');
  const pending   = stats.find((s: any) => s.status === 'PENDING');
  const failed    = stats.find((s: any) => s.status === 'FAILED');

  const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
    COMPLETED: { label: 'Confirmé', variant: 'success' },
    PENDING:   { label: 'En attente', variant: 'warning' },
    FAILED:    { label: 'Échoué', variant: 'danger' },
    REFUNDED:  { label: 'Remboursé', variant: 'warning' },
  };

  return (
    <div>
      <Topbar title="Paiements" subtitle="Transactions Wave CI">
        <div className="inline-flex items-center gap-1.5 bg-green-xpale text-green-soft text-[10px] px-2.5 py-1.5 rounded-full border border-border">
          🔐 Webhook HMAC-SHA256
        </div>
      </Topbar>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <MetricCard
            label="Paiements confirmés"
            value={completed?._count._all || 0}
            sub={formatPrice(completed?._sum.amount || 0)}
            subColor="text-[#27AE60]"
          />
          <MetricCard
            label="En attente"
            value={pending?._count._all || 0}
            sub="À relancer"
            subColor="text-ocre"
          />
          <MetricCard
            label="Échoués"
            value={failed?._count._all || 0}
            sub={formatPrice(failed?._sum.amount || 0)}
            subColor="text-red-600"
          />
        </div>

        <Card>
          <CardHeader
            title="Transactions Wave CI"
            subtitle={`${transactions.length} transactions`}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Référence Wave', 'Commande', 'Client', 'Montant', 'Statut', 'HMAC', 'Date'].map(h => (
                    <th key={h} className="text-[10px] font-medium text-text-light text-left px-4 py-2.5 bg-bg border-b border-border uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => {
                  const sb = STATUS_BADGE[t.status];
                  return (
                    <tr key={t.id} className="hover:bg-[#FAFAF8]">
                      <td className="text-xs px-4 py-3 border-b border-bg font-mono text-green-soft">
                        {t.waveRef || t.waveSessionId?.slice(0, 20) + '…' || '—'}
                      </td>
                      <td className="text-xs px-4 py-3 border-b border-bg font-mono font-medium">
                        {t.order.orderNumber}
                      </td>
                      <td className="text-xs px-4 py-3 border-b border-bg">
                        <div className="font-medium">{t.order.client.name}</div>
                        <div className="text-text-light">{t.order.client.phone}</div>
                      </td>
                      <td className="text-xs px-4 py-3 border-b border-bg font-medium">
                        {formatPrice(t.amount)}
                      </td>
                      <td className="text-xs px-4 py-3 border-b border-bg">
                        {sb ? <Badge variant={sb.variant}>{sb.label}</Badge> : t.status}
                      </td>
                      <td className="text-xs px-4 py-3 border-b border-bg">
                        {t.hmacVerified
                          ? <span className="text-green-mid font-medium">✓ Vérifié</span>
                          : <span className="text-ocre">⏳ En attente</span>}
                      </td>
                      <td className="text-[11px] text-text-light px-4 py-3 border-b border-bg whitespace-nowrap">
                        {formatDateTime(t.createdAt)}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-sm text-text-light">
                      Aucune transaction
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
