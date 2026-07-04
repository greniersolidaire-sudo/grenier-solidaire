// lib/storage.ts — Supabase Storage pour les images produits
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

// Client admin Supabase (uniquement côté serveur)
function getStorageClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Upload d'une image produit ───
export async function uploadProductImage(
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const client = getStorageClient();
  const path = `products/${Date.now()}-${filename}`;

  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ─── Supprimer une image produit ───
export async function deleteProductImage(imageUrl: string): Promise<void> {
  const client = getStorageClient();
  // Extraire le path depuis l'URL publique
  const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET}/`);
  if (urlParts.length < 2) return;

  const path = urlParts[1];
  await client.storage.from(BUCKET).remove([path]);
}
