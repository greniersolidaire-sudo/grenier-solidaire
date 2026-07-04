// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/utils';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        items: { include: { product: true } },
        transaction: true,
        delivery: { include: { collectionPoint: true } },
        cycle: true,
      },
    });
    if (!order) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('[GET /api/orders/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await req.json();
    const { status, deliveryStatus } = body;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(deliveryStatus && {
          delivery: { update: { status: deliveryStatus } },
        }),
      },
      include: { client: true, delivery: true },
    });

    // Mettre à jour total_spent client si commande livrée
    if (status === 'DELIVERED') {
      await prisma.client.update({
        where: { id: order.clientId },
        data: { totalSpent: { increment: order.total } },
      });
    }

    await logAdminAction({
      adminId: session.user.id,
      action: 'UPDATE_ORDER_STATUS',
      target: `order:${order.orderNumber}`,
      detail: { status, deliveryStatus },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[PATCH /api/orders/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
