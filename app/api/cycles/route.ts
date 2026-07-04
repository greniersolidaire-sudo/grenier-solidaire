// app/api/cycles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cycleSchema } from '@/lib/validations';
import { logAdminAction } from '@/lib/utils';

export async function GET() {
  try {
    const cycles = await prisma.cycle.findMany({
      orderBy: { opensAt: 'desc' },
      include: { _count: { select: { orders: true } } },
    });
    return NextResponse.json({ cycles });
  } catch (error) {
    console.error('[GET /api/cycles]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await req.json();
    const parsed = cycleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
    }

    const cycle = await prisma.cycle.create({
      data: {
        label: parsed.data.label,
        opensAt: new Date(parsed.data.opensAt),
        closesAt: new Date(parsed.data.closesAt),
        deliveryAt: new Date(parsed.data.deliveryAt),
        status: 'OPEN',
      },
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'CREATE_CYCLE',
      target: `cycle:${cycle.id}`,
      detail: { label: cycle.label },
    });

    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cycles]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
