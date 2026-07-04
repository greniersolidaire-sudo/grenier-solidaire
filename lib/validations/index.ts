// lib/validations/index.ts — Schémas de validation Zod

import { z } from 'zod';

// ─── Produit ───
export const productSchema = z.object({
  name: z.string().min(2, 'Nom trop court').max(100),
  unit: z.string().min(2, 'Conditionnement requis').max(100),
  categoryId: z.string().min(1, 'Catégorie requise'),
  bgColor: z.string().optional().default('#E8F5E9'),
  emoji: z.string().optional().default('📦'),
  detailQty: z.string().min(1, 'Libellé requis'),
  detailPrice: z.number().int().positive('Prix invalide'),
  grosQty: z.string().min(1, 'Libellé requis'),
  grosPrice: z.number().int().positive('Prix invalide'),
  grosThreshold: z.number().int().positive('Seuil invalide'),
  active: z.boolean().optional().default(true),
}).refine(data => data.grosPrice < data.detailPrice, {
  message: 'Le prix gros doit être inférieur au prix détail',
  path: ['grosPrice'],
});

export type ProductInput = z.infer<typeof productSchema>;

// ─── Commande (checkout) ───
export const orderSchema = z.object({
  clientName: z.string().min(2, 'Prénom requis'),
  clientPhone: z.string().min(8, 'Numéro invalide').max(20),
  clientQuartier: z.string().optional(),
  deliveryMode: z.enum(['COLLECTE', 'DOMICILE']),
  collectionPointId: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryZone: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    qty: z.number().int().positive(),
    price: z.number().int().positive(),
    tier: z.enum(['detail', 'gros']),
  })).min(1, 'Panier vide'),
}).refine(data => {
  if (data.deliveryMode === 'COLLECTE' && !data.collectionPointId) {
    return false;
  }
  if (data.deliveryMode === 'DOMICILE' && !data.deliveryAddress) {
    return false;
  }
  return true;
}, {
  message: 'Informations de livraison incomplètes',
  path: ['deliveryMode'],
});

export type OrderInput = z.infer<typeof orderSchema>;

// ─── Connexion admin ───
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Cycle ───
export const cycleSchema = z.object({
  label: z.string().min(3),
  opensAt: z.string().datetime(),
  closesAt: z.string().datetime(),
  deliveryAt: z.string().datetime(),
}).refine(data => new Date(data.closesAt) > new Date(data.opensAt), {
  message: 'La date de fermeture doit être après l\'ouverture',
  path: ['closesAt'],
});

export type CycleInput = z.infer<typeof cycleSchema>;
