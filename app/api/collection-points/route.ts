// app/api/collection-points/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const points = await prisma.collectionPoint.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ points });
  } catch (error) {
    console.error('[GET /api/collection-points]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
