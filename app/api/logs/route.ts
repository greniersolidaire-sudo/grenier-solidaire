// app/api/logs/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const limit = Number(req.nextUrl.searchParams.get('limit') || '50');

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { admin: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('[GET /api/logs]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
