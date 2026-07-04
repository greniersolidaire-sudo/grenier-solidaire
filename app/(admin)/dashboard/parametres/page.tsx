/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Topbar } from '@/components/admin/Topbar';
import { Card, CardHeader, Alert } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  const admin = session?.user?.id
    ? await prisma.adminUser.findUnique({ where: { id: session.user.id } })
    : null;

  const activePoints = await prisma.collectionPoint.count({ where: { active: true } });
  const totalPoints  = await prisma.collectionPoint.count();

  return (
    <div>
      <Topbar title="Paramètres" />
      <div className="p-6">
        <Alert variant="info">
          Section réservée au Super Admin. Toute modification est enregistrée dans le journal d&apos;activité.
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Compte administrateur" />
            <div className="p-4 space-y-3 text-sm">
              <Row label="Nom" value={admin?.name || '—'} />
              <Row label="Email" value={admin?.email || '—'} />
              <Row label="Rôle" value={admin?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Opérateur'} green />
              <Row label="Dernière connexion" value={admin?.lastLoginAt ? formatDateTime(admin.lastLoginAt) : '—'} />
              <Row label="Compte actif" value={admin?.active ? 'Oui' : 'Non'} green={admin?.active} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Intégrations" />
            <div className="p-4 space-y-3 text-sm">
              <Row label="Wave CI API" value={process.env.WAVE_API_KEY ? '✓ Configuré' : '⚠ Non configuré'} green={!!process.env.WAVE_API_KEY} />
              <Row label="Wave Webhook" value={process.env.WAVE_WEBHOOK_SECRET ? '✓ Configuré' : '⚠ Non configuré'} green={!!process.env.WAVE_WEBHOOK_SECRET} />
              <Row label="Supabase Storage" value={process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Configuré' : '⚠ Non configuré'} green={!!process.env.NEXT_PUBLIC_SUPABASE_URL} />
              <Row label="URL Application" value={process.env.NEXT_PUBLIC_APP_URL || '—'} />
              <Row label="Webhook URL" value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://greniersolidaire.ci'}/api/payment/webhook`} mono />
            </div>
          </Card>

          <Card>
            <CardHeader title="Points de collecte" subtitle={`${activePoints} actifs sur ${totalPoints}`} />
            <div className="p-4">
              <PointsList />
            </div>
          </Card>

          <Card>
            <CardHeader title="Sécurité" />
            <div className="p-4 space-y-3 text-sm">
              <Row label="Sessions" value="JWT · Expire après 8h" />
              <Row label="Webhook HMAC" value="SHA-256 · Vérification active" green />
              <Row label="RLS Supabase" value="Activé" green />
              <Row label="Audit Log" value="Toutes actions tracées" green />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green, mono }: { label: string; value: string; green?: boolean; mono?: boolean }) {
  return (
    <div className="flex justify-between py-2 border-b border-bg last:border-0">
      <span className="text-text-light">{label}</span>
      <span className={`font-medium ${green ? 'text-green-mid' : ''} ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</span>
    </div>
  );
}

async function PointsList() {
  const points = await prisma.collectionPoint.findMany({ orderBy: { name: 'asc' } });
  return (
    <div className="space-y-1.5">
      {points.map((p: any) => (
        <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-bg last:border-0">
          <div>
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-xs text-text-light">{p.address}</div>
          </div>
          <span className={`text-[11px] font-medium ${p.active ? 'text-green-mid' : 'text-red-600'}`}>
            {p.active ? '✓ Actif' : '✕ Inactif'}
          </span>
        </div>
      ))}
    </div>
  );
}
