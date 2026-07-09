// app/api/admin-users/route.ts
// GET  → liste tous les admins (Super Admin uniquement)
// POST → créer un nouveau compte admin (Super Admin uniquement)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAdminAction } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Vérifier que l'utilisateur est Super Admin
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (session.user.role !== 'SUPER_ADMIN') return null;
  return session;
}

// GET /api/admin-users
export async function GET() {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const admins = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('[GET /api/admin-users]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/admin-users
export async function POST(req: NextRequest) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, password, role } = body;

    // Validation
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    const validRoles = ['SUPER_ADMIN', 'GESTIONNAIRE', 'OPERATEUR'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer le compte
    const admin = await prisma.adminUser.create({
      data: { email, name, passwordHash, role, active: true },
      select: {
        id: true, email: true, name: true,
        role: true, active: true, createdAt: true,
      },
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'CREATE_ADMIN_USER',
      target: `admin:${admin.email}`,
      detail: { name, role },
    });

    return NextResponse.json({ admin }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin-users]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
