// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { uploadProductImage, deleteProductImage } from '@/lib/storage';
import { logAdminAction } from '@/lib/utils';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });
    if (!product) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json({ product });
  } catch (error) {
    console.error('[GET /api/products/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';
    let updates: Record<string, unknown> = {};
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      imageFile = formData.get('image') as File | null;
      updates = {
        name: formData.get('name'),
        unit: formData.get('unit'),
        categoryId: formData.get('categoryId'),
        bgColor: formData.get('bgColor'),
        emoji: formData.get('emoji'),
        detailQty: formData.get('detailQty'),
        detailPrice: Number(formData.get('detailPrice')),
        grosQty: formData.get('grosQty'),
        grosPrice: Number(formData.get('grosPrice')),
        grosThreshold: Number(formData.get('grosThreshold')),
        active: formData.get('active') !== 'false',
      };
      // Supprimer les undefined
      Object.keys(updates).forEach(k => updates[k] === null && delete updates[k]);
    } else {
      updates = await req.json();
    }

    // Upload nouvelle image si fournie
    if (imageFile && imageFile.size > 0) {
      const current = await prisma.product.findUnique({ where: { id: params.id } });
      if (current?.imageUrl) await deleteProductImage(current.imageUrl).catch(() => {});
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      updates.imageUrl = await uploadProductImage(buffer, imageFile.name, imageFile.type);
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updates,
      include: { category: true },
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'UPDATE_PRODUCT',
      target: `product:${params.id}`,
      detail: updates,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('[PATCH /api/products/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

    if (product.imageUrl) await deleteProductImage(product.imageUrl).catch(() => {});

    await prisma.product.delete({ where: { id: params.id } });

    await logAdminAction({
      adminId: session.user.id,
      action: 'DELETE_PRODUCT',
      target: `product:${params.id}`,
      detail: { name: product.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/products/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
