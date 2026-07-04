// app/api/orders/route.ts
// POST /api/orders → créer une commande
// GET  /api/orders → liste commandes (admin)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { orderSchema } from '@/lib/validations';
import { generateOrderNumber, getActiveCycle } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const status = req.nextUrl.searchParams.get('status');
    const cycleId = req.nextUrl.searchParams.get('cycleId');

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status: status as never }),
        ...(cycleId && { cycleId }),
      },
      include: {
        client: true,
        items: { include: { product: true } },
        transaction: true,
        delivery: { include: { collectionPoint: true } },
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Vérifier le cycle actif
    const cycle = await getActiveCycle();
    if (!cycle) {
      return NextResponse.json(
        { error: 'Aucun cycle de commande actif pour le moment.' },
        { status: 400 }
      );
    }

    // Récupérer ou créer le client
    let client = await prisma.client.findUnique({
      where: { phone: data.clientPhone },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: data.clientName,
          phone: data.clientPhone,
          quartier: data.clientQuartier,
        },
      });
    }

    // Calculer le total et vérifier les produits
    let total = 0;
    const itemsData = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Produit ${item.productId} indisponible` },
          { status: 400 }
        );
      }
      const subtotal = item.price * item.qty;
      total += subtotal;
      itemsData.push({
        productId: item.productId,
        qty: item.qty,
        price: item.price,
        tier: item.tier,
        subtotal,
      });
    }

    // Frais de livraison
    const deliveryFee = data.deliveryMode === 'DOMICILE' ? 1500 : 0;
    total += deliveryFee;

    // Générer le numéro de commande
    const orderNumber = await generateOrderNumber();

    // Créer la commande avec toutes ses relations
    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: client.id,
        cycleId: cycle.id,
        total,
        status: 'PENDING',
        items: { create: itemsData },
        transaction: {
          create: { amount: total, currency: 'XOF', status: 'PENDING' },
        },
        delivery: {
          create: {
            mode: data.deliveryMode,
            collectionPointId: data.deliveryMode === 'COLLECTE' ? data.collectionPointId : undefined,
            address: data.deliveryMode === 'DOMICILE' ? data.deliveryAddress : undefined,
            zone: data.deliveryZone,
            deliveryFee,
            status: 'PENDING',
          },
        },
      },
      include: {
        items: { include: { product: true } },
        client: true,
        delivery: { include: { collectionPoint: true } },
      },
    });

    // Mettre à jour le compteur client
    await prisma.client.update({
      where: { id: client.id },
      data: { ordersCount: { increment: 1 } },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/orders]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
