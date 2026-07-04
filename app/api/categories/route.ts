import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({
      categories: [{ id: 'all', label: 'Tous', sortOrder: 0 }, ...categories],
    });
  } catch (error) {
    console.error('[GET /api/categories]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { id, label, sortOrder } = body;

    if (!id || !label) {
      return NextResponse.json({ error: 'id et label requis' }, { status: 400 });
    }

    // Vérifier que l'id n'existe pas déjà
    const existing = await prisma.category.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ error: 'Cette catégorie existe déjà' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        id: id.toLowerCase().replace(/\s+/g, '_'),
        label,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/categories]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await req.json();

    // Vérifier qu'aucun produit n'utilise cette catégorie
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : ${productsCount} produit(s) utilisent cette catégorie` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/categories]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}


// // app/api/categories/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// export async function GET() {
//   try {
//     const categories = await prisma.category.findMany({
//       orderBy: { sortOrder: 'asc' },
//     });
//     return NextResponse.json({
//       categories: [{ id: 'all', label: 'Tous', sortOrder: 0 }, ...categories],
//     });
//   } catch (error) {
//     console.error('[GET /api/categories]', error);
//     return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
//   }
// }
