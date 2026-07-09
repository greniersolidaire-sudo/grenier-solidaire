export type AdminRole = 'SUPER_ADMIN' | 'GESTIONNAIRE' | 'OPERATEUR';

export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  SUPER_ADMIN: [
    '/dashboard',
    '/dashboard/commandes',
    '/dashboard/produits',
    '/dashboard/categories',
    '/dashboard/paiements',
    '/dashboard/livraisons',
    '/dashboard/clients',
    '/dashboard/cycles',
    '/dashboard/rapports',
    '/dashboard/logs',
    '/dashboard/parametres',
    '/dashboard/admins',
  ],
  GESTIONNAIRE: [
    '/dashboard',
    '/dashboard/commandes',
    '/dashboard/produits',
    '/dashboard/categories',
    '/dashboard/paiements',
    '/dashboard/livraisons',
    '/dashboard/clients',
    '/dashboard/rapports',
  ],
  OPERATEUR: [
    '/dashboard',
    '/dashboard/commandes',
    '/dashboard/livraisons',
  ],
};

export function hasAccess(role: AdminRole, path: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  // console.log('====================================');
  // console.log("permissions : ", permissions);
  // console.log('====================================');
  return permissions.some(p => path === p || path.startsWith(p + '/'));
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  GESTIONNAIRE: 'Gestionnaire',
  OPERATEUR: 'Opérateur',
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Accès complet à toutes les fonctionnalités',
  GESTIONNAIRE: 'Catalogue, commandes, clients et paiements',
  OPERATEUR: 'Commandes et livraisons uniquement',
};

export const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'bg-green-pale text-green',
  GESTIONNAIRE: 'bg-blue-50 text-blue-700',
  OPERATEUR: 'bg-ocre-pale text-ocre',
};


// export type AdminRole = 'SUPER_ADMIN' | 'GESTIONNAIRE' | 'OPERATEUR';

// export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
//   SUPER_ADMIN: [
//     '/dashboard',
//     '/dashboard/commandes',
//     '/dashboard/produits',
//     '/dashboard/categories',
//     '/dashboard/paiements',
//     '/dashboard/livraisons',
//     '/dashboard/clients',
//     '/dashboard/cycles',
//     '/dashboard/rapports',
//     '/dashboard/logs',
//     '/dashboard/parametres',
//     '/dashboard/admins',
//   ],
//   GESTIONNAIRE: [
//     '/dashboard',
//     '/dashboard/commandes',
//     '/dashboard/produits',
//     '/dashboard/categories',
//     '/dashboard/paiements',
//     '/dashboard/livraisons',
//     '/dashboard/clients',
//     '/dashboard/rapports',
//   ],
//   OPERATEUR: [
//     '/dashboard',
//     '/dashboard/commandes',
//     '/dashboard/livraisons',
//   ],
// };

// export function hasAccess(role: AdminRole, path: string): boolean {
//   const permissions = ROLE_PERMISSIONS[role] || [];

//   console.log('ROLE:', role);

//   return permissions.some(p => path === p || path.startsWith(p + '/'));
// }


// export const ROLE_LABELS: Record<AdminRole, string> = {
//   SUPER_ADMIN: 'Super Admin',
//   GESTIONNAIRE: 'Gestionnaire',
//   OPERATEUR: 'Opérateur',
// };

// export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
//   SUPER_ADMIN: 'Accès complet à toutes les fonctionnalités',
//   GESTIONNAIRE: 'Catalogue, commandes, clients et paiements',
//   OPERATEUR: 'Commandes et livraisons uniquement',
// };

// export const ROLE_COLORS: Record<AdminRole, string> = {
//   SUPER_ADMIN: 'bg-green-pale text-green',
//   GESTIONNAIRE: 'bg-blue-50 text-blue-700',
//   OPERATEUR: 'bg-ocre-pale text-ocre',
// };


// // lib/permissions.ts
// // Définition des permissions par rôle
// // Ce fichier est la source de vérité pour toutes les autorisations

// export type AdminRole = 'SUPER_ADMIN' | 'GESTIONNAIRE' | 'OPERATEUR';

// // Pages accessibles par rôle
// export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
//   SUPER_ADMIN: [
//     '/dashboard',
//     '/dashboard/commandes',
//     '/dashboard/catalogue',
//     '/dashboard/categories',
//     '/dashboard/paiements',
//     '/dashboard/livraisons',
//     '/dashboard/clients',
//     '/dashboard/cycles',
//     '/dashboard/rapports',
//     '/dashboard/logs',
//     '/dashboard/parametres',
//     '/dashboard/admins',
//   ],
//   GESTIONNAIRE: [
//     '/dashboard',
//     '/dashboard/commandes',
//     '/dashboard/catalogue',
//     '/dashboard/categories',
//     '/dashboard/paiements',
//     '/dashboard/livraisons',
//     '/dashboard/clients',
//     '/dashboard/rapports',
//   ],
//   OPERATEUR: [
//     '/dashboard',
//     '/dashboard/commandes',
//     '/dashboard/livraisons',
//   ],
// };

// // Vérifie si un rôle a accès à une page
// export function hasAccess(role: AdminRole, path: string): boolean {
//   const permissions = ROLE_PERMISSIONS[role] || [];
//   return permissions.some(p => path === p || path.startsWith(p + '/'));
// }

// // Labels lisibles pour l'interface
// export const ROLE_LABELS: Record<AdminRole, string> = {
//   SUPER_ADMIN: 'Super Admin',
//   GESTIONNAIRE: 'Gestionnaire',
//   OPERATEUR: 'Opérateur',
// };

// // Description des rôles
// export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
//   SUPER_ADMIN: 'Accès complet à toutes les fonctionnalités',
//   GESTIONNAIRE: 'Catalogue, commandes, clients et paiements',
//   OPERATEUR: 'Commandes et livraisons uniquement',
// };

// // Couleurs des badges par rôle
// export const ROLE_COLORS: Record<AdminRole, string> = {
//   SUPER_ADMIN: 'bg-green-pale text-green',
//   GESTIONNAIRE: 'bg-blue-50 text-blue-700',
//   OPERATEUR: 'bg-ocre-pale text-ocre',
// };
