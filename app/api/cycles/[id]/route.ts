// app/api/cycles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/utils';

type Params = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'close') {
      // Annuler les commandes PENDING avant la fermeture
      await prisma.order.updateMany({
        where: { cycleId: params.id, status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });

      const cycle = await prisma.cycle.update({
        where: { id: params.id },
        data: { status: 'CLOSED' },
      });

      await logAdminAction({
        adminId: session.user.id,
        action: 'CLOSE_CYCLE',
        target: `cycle:${params.id}`,
        detail: { label: cycle.label },
      });

      return NextResponse.json({ cycle });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (error) {
    console.error('[PATCH /api/cycles/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
