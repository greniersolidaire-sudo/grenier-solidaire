'use client';
// app/(admin)/dashboard/admins/page.tsx
// Page de gestion des comptes administrateurs
// Accessible uniquement au Super Admin

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Topbar } from '@/components/admin/Topbar';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal, ModalActions, ModalDangerBox } from '@/components/ui/Modal';
import { Card, CardHeader, Alert } from '@/components/ui/Badge';
import { TableAction } from '@/components/ui/DataTable';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS, AdminRole } from '@/lib/permissions';
import { formatDateTime } from '@/lib/utils';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const createSchema = z.object({
  name: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Mot de passe requis (min. 8 caractères)'),
  role: z.enum(['SUPER_ADMIN', 'GESTIONNAIRE', 'OPERATEUR']),
});

const editSchema = z.object({
  name: z.string().min(2, 'Nom requis').optional(),
  role: z.enum(['SUPER_ADMIN', 'GESTIONNAIRE', 'OPERATEUR']).optional(),
  password: z.string().min(8, 'Min. 8 caractères').optional().or(z.literal('')),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const createForm = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'OPERATEUR' },
  });

  const editForm = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin-users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdmins(data.admins || []);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (data: CreateForm) => {
    setSaving(true);
    setApiError('');
    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setShowCreate(false);
      createForm.reset();
      fetchAdmins();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data: EditForm) => {
    if (!editAdmin) return;
    setSaving(true);
    setApiError('');
    try {
      // Ne pas envoyer password si vide
      const payload = { ...data };
      if (!payload.password) delete payload.password;

      const res = await fetch(`/api/admin-users/${editAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setEditAdmin(null);
      editForm.reset();
      fetchAdmins();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin-users/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDeactivateId(null);
      fetchAdmins();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    try {
      const res = await fetch(`/api/admin-users/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !admin.active }),
      });
      if (!res.ok) throw new Error('Erreur');
      fetchAdmins();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const openEdit = (admin: AdminUser) => {
    setEditAdmin(admin);
    editForm.reset({ name: admin.name, role: admin.role, password: '' });
    setApiError('');
  };

  const activeAdmins = admins.filter(a => a.active);
  const inactiveAdmins = admins.filter(a => !a.active);

  return (
    <div>
      <Topbar
        title="Gestion des administrateurs"
        subtitle={`${activeAdmins.length} compte${activeAdmins.length > 1 ? 's' : ''} actif${activeAdmins.length > 1 ? 's' : ''}`}
      >
        <Button
          size="sm"
          onClick={() => { setShowCreate(true); setApiError(''); createForm.reset({ role: 'OPERATEUR' }); }}
        >
          + Nouveau compte
        </Button>
      </Topbar>

      <div className="p-6">
        {apiError && !showCreate && !editAdmin && (
          <Alert variant="danger">{apiError}</Alert>
        )}

        {/* Explication des rôles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {(Object.entries(ROLE_LABELS) as [AdminRole, string][]).map(([role, label]) => (
            <div key={role} className="bg-white rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[role]}`}>
                  {label}
                </span>
              </div>
              <p className="text-xs text-text-light">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          ))}
        </div>

        {/* Liste des comptes */}
        <Card>
          <CardHeader
            title="Comptes administrateurs"
            subtitle={`${admins.length} compte${admins.length > 1 ? 's' : ''} au total`}
          />

          {loading ? (
            <div className="p-8 text-center text-sm text-text-light animate-pulse">
              Chargement…
            </div>
          ) : (
            <div className="divide-y divide-bg">
              {admins.map(admin => (
                <div key={admin.id} className={`flex items-center justify-between px-5 py-4 ${!admin.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white flex-shrink-0 ${admin.active ? 'bg-green' : 'bg-text-light'}`}>
                      {admin.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[14px] text-text">{admin.name}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[admin.role]}`}>
                          {ROLE_LABELS[admin.role]}
                        </span>
                        {!admin.active && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-light mt-0.5">{admin.email}</div>
                      <div className="text-[10px] text-text-light mt-0.5">
                        {admin.lastLoginAt
                          ? `Dernière connexion : ${formatDateTime(admin.lastLoginAt)}`
                          : 'Jamais connecté'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <TableAction onClick={() => openEdit(admin)} title="Modifier">✎</TableAction>
                    <TableAction
                      onClick={() => handleToggleActive(admin)}
                      title={admin.active ? 'Désactiver' : 'Réactiver'}
                      variant={admin.active ? 'danger' : 'success'}
                    >
                      {admin.active ? '✕' : '✓'}
                    </TableAction>
                  </div>
                </div>
              ))}

              {admins.length === 0 && (
                <div className="p-8 text-center text-sm text-text-light">
                  Aucun compte administrateur.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Modal créer un compte */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Nouveau compte administrateur"
        size="sm"
      >
        <form onSubmit={createForm.handleSubmit(handleCreate)}>
          <div className="flex flex-col gap-3 mb-4">
            <Input
              label="Nom complet *"
              placeholder="Ex: Marie Koné"
              error={createForm.formState.errors.name?.message}
              {...createForm.register('name')}
            />
            <Input
              label="Adresse email *"
              type="email"
              placeholder="marie@greniersolidaire.ci"
              error={createForm.formState.errors.email?.message}
              {...createForm.register('email')}
            />
            <Input
              label="Mot de passe *"
              type="password"
              placeholder="Min. 8 caractères"
              hint="Le collaborateur pourra le changer après sa première connexion"
              error={createForm.formState.errors.password?.message}
              {...createForm.register('password')}
            />
            <Select
              label="Rôle *"
              error={createForm.formState.errors.role?.message}
              {...createForm.register('role')}
            >
              <option value="OPERATEUR">Opérateur — Commandes et livraisons</option>
              <option value="GESTIONNAIRE">Gestionnaire — Catalogue, commandes, clients</option>
              <option value="SUPER_ADMIN">Super Admin — Accès complet</option>
            </Select>
          </div>

          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <ModalActions>
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={saving}>
              Créer le compte
            </Button>
          </ModalActions>
        </form>
      </Modal>

      {/* Modal modifier un compte */}
      <Modal
        open={!!editAdmin}
        onClose={() => setEditAdmin(null)}
        title={`Modifier — ${editAdmin?.name}`}
        subtitle={editAdmin?.email}
        size="sm"
      >
        <form onSubmit={editForm.handleSubmit(handleEdit)}>
          <div className="flex flex-col gap-3 mb-4">
            <Input
              label="Nom complet"
              placeholder="Nom du collaborateur"
              error={editForm.formState.errors.name?.message}
              {...editForm.register('name')}
            />
            <Select
              label="Rôle"
              error={editForm.formState.errors.role?.message}
              {...editForm.register('role')}
            >
              <option value="OPERATEUR">Opérateur — Commandes et livraisons</option>
              <option value="GESTIONNAIRE">Gestionnaire — Catalogue, commandes, clients</option>
              <option value="SUPER_ADMIN">Super Admin — Accès complet</option>
            </Select>
            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="Laisser vide pour ne pas changer"
              hint="Optionnel — uniquement si vous souhaitez le réinitialiser"
              error={editForm.formState.errors.password?.message}
              {...editForm.register('password')}
            />
          </div>

          {apiError && <Alert variant="danger">{apiError}</Alert>}

          <ModalActions>
            <Button type="button" variant="secondary" onClick={() => setEditAdmin(null)}>
              Annuler
            </Button>
            <Button type="submit" loading={saving}>
              Enregistrer
            </Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
