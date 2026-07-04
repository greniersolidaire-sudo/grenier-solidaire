/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { Topbar } from '@/components/admin/Topbar';
import { Card, CardHeader, Alert } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'text-[#27AE60]',
  UPDATE: 'text-blue-600',
  DELETE: 'text-red-600',
  CLOSE:  'text-ocre',
  LOGIN:  'text-text-light',
};

function getActionColor(action: string) {
  const key = Object.keys(ACTION_COLOR).find(k => action.startsWith(k));
  return key ? ACTION_COLOR[key] : 'text-text';
}

export default async function LogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { admin: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <Topbar title="Journal d'activité" subtitle={`${logs.length} entrées récentes`}>
        <div className="inline-flex items-center gap-1.5 bg-green-xpale text-green-soft text-[10px] px-2.5 py-1.5 rounded-full border border-border">
          🔐 Immuable · Toutes actions tracées
        </div>
      </Topbar>

      <div className="p-6">
        <Alert variant="info">
          Chaque action administrative est enregistrée avec l&apos;heure, l&apos;utilisateur et l&apos;adresse IP.
          Ce journal ne peut pas être modifié ni supprimé.
        </Alert>

        <Card>
          <CardHeader title="Journal des 100 dernières actions" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Heure', 'Administrateur', 'Action', 'Cible', 'IP'].map(h => (
                    <th key={h} className="text-[10px] font-medium text-text-light text-left px-4 py-2.5 bg-bg border-b border-border uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#FAFAF8]">
                    <td className="text-[11px] text-text-light px-4 py-3 border-b border-bg whitespace-nowrap font-mono">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="text-xs px-4 py-3 border-b border-bg">
                      <div className="font-medium text-green-soft">{log.admin?.name || '—'}</div>
                      <div className="text-text-light text-[10px]">{log.admin?.email}</div>
                    </td>
                    <td className={`text-xs font-medium px-4 py-3 border-b border-bg ${getActionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </td>
                    <td className="text-[11px] text-text-light px-4 py-3 border-b border-bg font-mono">
                      {log.target || '—'}
                    </td>
                    <td className="text-[11px] text-text-light px-4 py-3 border-b border-bg font-mono">
                      {log.ip || '—'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-sm text-text-light">Aucune activité</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
