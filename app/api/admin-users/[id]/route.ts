// app/api/admin-users/[id]/route.ts
// PATCH  → modifier un compte admin (rôle, nom, mot de passe, actif/inactif)
// DELETE → supprimer un compte admin

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAdminAction } from '@/lib/utils';

type Params = { params: { id: string } };

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  if (session.user.role !== 'SUPER_ADMIN') return null;
  return session;
}

// PATCH /api/admin-users/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Empêcher de modifier son propre compte
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre compte ici' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, role, active, password } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (typeof active === 'boolean') updateData.active = active;
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 8 caractères' },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const admin = await prisma.adminUser.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true, email: true, name: true,
        role: true, active: true,
      },
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'UPDATE_ADMIN_USER',
      target: `admin:${admin.email}`,
      detail: { changes: Object.keys(updateData) },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('[PATCH /api/admin-users/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/admin-users/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await requireSuperAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Empêcher de supprimer son propre compte
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });
    if (!admin) {
      return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
    }

    // Plutôt que supprimer, on désactive (meilleur pour l'audit)
    await prisma.adminUser.update({
      where: { id: params.id },
      data: { active: false },
    });

    await logAdminAction({
      adminId: session.user.id,
      action: 'DEACTIVATE_ADMIN_USER',
      target: `admin:${admin.email}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin-users/[id]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
