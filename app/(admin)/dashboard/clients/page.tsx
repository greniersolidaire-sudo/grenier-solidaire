/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { Topbar } from '@/components/admin/Topbar';
import { Card, CardHeader } from '@/components/ui/Badge';
import { formatPrice, formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { totalSpent: 'desc' },
    include: {
      _count: { select: { orders: true } },
      orders: { take: 1, orderBy: { createdAt: 'desc' }, select: { createdAt: true, orderNumber: true } },
    },
  });

  return (
    <div>
      <Topbar title="Clients" subtitle={`${clients.length} client${clients.length > 1 ? 's' : ''}`} />
      <div className="p-6">
        <Card>
          <CardHeader title="Base clients" subtitle="Classés par CA total" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Client', 'WhatsApp', 'Quartier', 'Commandes', 'CA total', 'Dernière commande', 'Actions'].map(h => (
                    <th key={h} className="text-[10px] font-medium text-text-light text-left px-4 py-2.5 bg-bg border-b border-border uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map((c: any, i: number) => (
                  <tr key={c.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-3 border-b border-bg">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0 ${i < 3 ? 'bg-green' : 'bg-green-soft'}`}>
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="font-medium text-[13px]">{c.name}</div>
                      </div>
                    </td>
                    <td className="text-xs text-text-light px-4 py-3 border-b border-bg">{c.phone}</td>
                    <td className="text-xs text-text-light px-4 py-3 border-b border-bg">{c.quartier || '—'}</td>
                    <td className="text-xs font-medium px-4 py-3 border-b border-bg">{c._count.orders}</td>
                    <td className="text-xs font-medium text-green px-4 py-3 border-b border-bg">{formatPrice(c.totalSpent)}</td>
                    <td className="text-[11px] text-text-light px-4 py-3 border-b border-bg whitespace-nowrap">
                      {c.orders[0] ? (
                        <div>
                          <div>{c.orders[0].orderNumber}</div>
                          <div>{formatDateTime(c.orders[0].createdAt)}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 border-b border-bg">
                      <a
                        href={`https://wa.me/${c.phone.replace(/\s/g, '')}?text=${encodeURIComponent(`Bonjour ${c.name}, merci pour votre fidélité chez Grenier Solidaire !`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-7 h-7 rounded-md border border-border bg-white flex items-center justify-center text-xs hover:border-green hover:text-green transition-colors"
                        title="Contacter sur WhatsApp"
                      >
                        💬
                      </a>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-sm text-text-light">Aucun client</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
