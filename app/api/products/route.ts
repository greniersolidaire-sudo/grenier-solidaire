// app/api/products/route.ts
// GET  /api/products          → produits actifs (catalogue client)
// GET  /api/products?all=true → tous les produits (admin)
// POST /api/products          → créer un produit (admin)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validations';
import { uploadProductImage } from '@/lib/storage';
import { logAdminAction } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const showAll = req.nextUrl.searchParams.get('all') === 'true';

    const products = await prisma.product.findMany({
      where: showAll ? undefined : { active: true },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('[GET /api/products]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    // Parser les champs du formulaire
    const body = {
      name: formData.get('name') as string,
      unit: formData.get('unit') as string,
      categoryId: formData.get('categoryId') as string,
      bgColor: formData.get('bgColor') as string || '#E8F5E9',
      emoji: formData.get('emoji') as string || '📦',
      detailQty: formData.get('detailQty') as string,
      detailPrice: Number(formData.get('detailPrice')),
      grosQty: formData.get('grosQty') as string,
      grosPrice: Number(formData.get('grosPrice')),
      grosThreshold: Number(formData.get('grosThreshold')),
      active: formData.get('active') !== 'false',
    };

    // Validation Zod
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Upload image si fournie
    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      imageUrl = await uploadProductImage(buffer, imageFile.name, imageFile.type);
    }

    const product = await prisma.product.create({
      data: { ...parsed.data, imageUrl },
      include: { category: true },
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'CREATE_PRODUCT',
      target: `product:${product.id}`,
      detail: { name: product.name },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/products]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
