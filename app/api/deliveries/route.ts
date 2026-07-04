// app/api/deliveries/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const deliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        collectionPoint: true,
        order: { include: { client: true } },
      },
    });

    return NextResponse.json({ deliveries });
  } catch (error) {
    console.error('[GET /api/deliveries]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
