// lib/utils.ts — Fonctions utilitaires
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { prisma } from './prisma';

// Fusionner les classes Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Générer un numéro de commande unique
export async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const num = String(count + 1).padStart(4, '0');
  const year = new Date().getFullYear().toString().slice(-2);
  return `GS-${year}-${num}`;
}

// Formater un montant en FCFA
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-CI').format(amount) + ' F';
}

// Formater une date en français
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// Formater date + heure
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Logger une action admin
export async function logAdminAction({
  adminId,
  action,
  target,
  detail,
  ip,
}: {
  adminId?: string;
  action: string;
  target?: string;
  detail?: object;
  ip?: string;
}) {
  await prisma.auditLog.create({
    data: { adminId, action, target, detail, ip },
  });
}

// Obtenir le cycle actif
export async function getActiveCycle() {
  return prisma.cycle.findFirst({
    where: { status: 'OPEN' },
    orderBy: { opensAt: 'desc' },
  });
}
