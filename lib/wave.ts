// lib/wave.ts — Client Wave CI Checkout API
import crypto from 'crypto';

const WAVE_API_URL = process.env.WAVE_API_URL || 'https://api.wave.com/v1';
const WAVE_API_KEY = process.env.WAVE_API_KEY!;
const WAVE_WEBHOOK_SECRET = process.env.WAVE_WEBHOOK_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export type WaveCheckoutSession = {
  id: string;
  wave_launch_url: string;
  client_reference: string;
  amount: string;
  currency: string;
  checkout_status: string;
};

// ─── Créer une session de paiement Wave ───
export async function createWaveCheckoutSession({
  orderId,
  orderNumber,
  amount, // en XOF (entier)
}: {
  orderId: string;
  orderNumber: string;
  amount: number;
}): Promise<WaveCheckoutSession> {
  const response = await fetch(`${WAVE_API_URL}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WAVE_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': orderId, // Évite les doublons en cas de retry
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: 'XOF',
      client_reference: orderNumber,
      success_url: `${APP_URL}/confirmation?order=${orderId}`,
      error_url: `${APP_URL}/paiement-echec?order=${orderId}`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Wave API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

// ─── Récupérer le statut d'une session Wave ───
export async function getWaveCheckoutSession(sessionId: string): Promise<WaveCheckoutSession> {
  const response = await fetch(`${WAVE_API_URL}/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${WAVE_API_KEY}` },
  });

  if (!response.ok) {
    throw new Error(`Wave API error: ${response.statusText}`);
  }

  return response.json();
}

// ─── Vérifier la signature HMAC du webhook Wave ───
export function verifyWaveWebhookSignature(
  payload: string,
  signatureHeader: string
): boolean {
  try {
    // Format: "t={timestamp},v1={signature}"
    const parts = signatureHeader.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.replace('t=', '');
    const signature = parts.find(p => p.startsWith('v1='))?.replace('v1=', '');

    if (!timestamp || !signature) return false;

    // Vérifier que le timestamp est récent (max 5 minutes)
    const timeDiff = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (timeDiff > 300) return false;

    // Calculer le HMAC attendu
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', WAVE_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');

    // Comparaison sécurisée (anti timing attack)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
