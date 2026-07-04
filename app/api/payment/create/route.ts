// app/api/payment/create/route.ts
// POST → Créer une session de paiement Wave CI

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createWaveCheckoutSession } from '@/lib/wave';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId requis' }, { status: 400 });
    }

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette commande ne peut plus être payée' },
        { status: 400 }
      );
    }

    // Créer la session Wave
    const waveSession = await createWaveCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
    });

    // Sauvegarder l'ID de session Wave dans la commande
    await prisma.order.update({
      where: { id: orderId },
      data: {
        waveSessionId: waveSession.id,
        waveLaunchUrl: waveSession.wave_launch_url,
        transaction: {
          update: { waveSessionId: waveSession.id },
        },
      },
    });

    return NextResponse.json({
      waveSessionId: waveSession.id,
      waveLaunchUrl: waveSession.wave_launch_url,
    });
  } catch (error) {
    console.error('[POST /api/payment/create]', error);
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
  }
}
