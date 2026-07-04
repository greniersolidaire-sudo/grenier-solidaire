// app/api/payment/webhook/route.ts
// POST → Webhook Wave CI — reçoit les événements de paiement
// Sécurisé par HMAC-SHA256

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWaveWebhookSignature, getWaveCheckoutSession } from '@/lib/wave';

// // Désactiver le body parsing automatique (on a besoin du raw body pour HMAC)
// export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('Wave-Signature') || '';

    // ─── VÉRIFICATION HMAC ───
    if (!verifyWaveWebhookSignature(rawBody, signature)) {
      console.error('[WEBHOOK] Signature HMAC invalide');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log('[WEBHOOK] Event reçu:', event.type, event.data?.id);

    const sessionId = event.data?.id;
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID manquant' }, { status: 400 });
    }

    // ─── PAIEMENT RÉUSSI ───
    if (event.type === 'checkout.session.completed') {
      // Vérification double auprès de l'API Wave (ne jamais faire confiance qu'au webhook)
      const waveSession = await getWaveCheckoutSession(sessionId);

      if (waveSession.checkout_status !== 'complete') {
        console.warn('[WEBHOOK] Statut Wave non complet:', waveSession.checkout_status);
        return NextResponse.json({ received: true });
      }

      // Trouver la commande correspondante
      const order = await prisma.order.findFirst({
        where: { waveSessionId: sessionId },
      });

      if (!order) {
        console.error('[WEBHOOK] Commande introuvable pour session:', sessionId);
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      }

      if (order.status === 'PAID') {
        // Déjà traité (idempotence)
        return NextResponse.json({ received: true });
      }

      // Mettre à jour la commande et la transaction
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        }),
        prisma.transaction.update({
          where: { orderId: order.id },
          data: {
            status: 'COMPLETED',
            waveRef: waveSession.id,
            hmacVerified: true,
            rawPayload: event as never,
          },
        }),
        prisma.client.update({
          where: { id: order.clientId },
          data: { totalSpent: { increment: order.total } },
        }),
      ]);

      console.log('[WEBHOOK] Commande payée:', order.orderNumber);
    }

    // ─── PAIEMENT ÉCHOUÉ ───
    if (event.type === 'checkout.session.payment_failed') {
      const order = await prisma.order.findFirst({
        where: { waveSessionId: sessionId },
      });

      if (order) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: 'FAILED' },
          }),
          prisma.transaction.update({
            where: { orderId: order.id },
            data: {
              status: 'FAILED',
              hmacVerified: true,
              rawPayload: event as never,
            },
          }),
        ]);
        console.log('[WEBHOOK] Paiement échoué:', order.orderNumber);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Erreur:', error);
    // Retourner 200 pour éviter les retentatives Wave sur des erreurs serveur
    return NextResponse.json({ received: true });
  }
}
