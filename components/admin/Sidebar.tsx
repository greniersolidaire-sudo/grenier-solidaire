'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { hasAccess, ROLE_LABELS, AdminRole } from '@/lib/permissions';
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard,
  Truck, Users, Calendar, BarChart2, FileText,
  Settings, LogOut, Tag, UserCog,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type NavGroup = {
  section: string;
  items: NavItem[];
};

const ALL_NAV: NavGroup[] = [
  {
    section: 'Principal',
    items: [
      { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { href: '/dashboard/commandes', label: 'Commandes', icon: ShoppingBag },
      { href: '/dashboard/produits', label: 'Catalogue', icon: Package },
      { href: '/dashboard/categories', label: 'Catégories', icon: Tag },
      { href: '/dashboard/paiements', label: 'Paiements', icon: CreditCard },
      { href: '/dashboard/livraisons', label: 'Livraisons', icon: Truck },
      { href: '/dashboard/clients', label: 'Clients', icon: Users },
      { href: '/dashboard/cycles', label: 'Cycles', icon: Calendar },
    ],
  },
  {
    section: 'Analyse',
    items: [
      { href: '/dashboard/rapports', label: 'Rapports', icon: BarChart2 },
      { href: '/dashboard/logs', label: "Journal d'activité", icon: FileText },
    ],
  },
  {
    section: 'Administration',
    items: [
      { href: '/dashboard/admins', label: 'Administrateurs', icon: UserCog },
      { href: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
    ],
  },
];

type Props = {
  user: {
    name: string;
    email: string;
    role: AdminRole;
  };
};

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname();
  const { role, name } = user;

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className="bg-green flex flex-col sticky top-0 h-screen overflow-y-auto scrollbar-none">
      {/* Logo */}
      <div className="p-4 pb-3.5 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[30px] h-[30px] bg-white/15 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
              <path
                d="M3 8h14M3 12h14M7 4l-2 12M13 4l2 12"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-serif text-[15px] text-white">Grenier Solidaire</div>
            <div className="text-[10px] text-white/45">Administration</div>
          </div>
        </div>

        {/* Utilisateur connecté */}
        <div className="bg-white/[0.07] rounded-xl px-3 py-2.5 flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-white truncate">{name}</div>
            <div className="text-[10px] text-ocre-pale">
              {ROLE_LABELS[role]}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation filtrée par rôle */}
      {ALL_NAV.map((group) => {
        const accessibleItems = group.items.filter((item) =>
          hasAccess(role, item.href)
        );

        if (accessibleItems.length === 0) return null;

        const testAccess = hasAccess(role, '/dashboard/produits');
console.log('Role:', role, '| hasAccess produits:', testAccess);

        return (
          <div key={group.section} className="pt-3">
            <div className="text-[9px] font-medium tracking-widest uppercase text-white/30 px-4 mb-1.5">
              {group.section}
            </div>
            {accessibleItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' &&
                  pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all border-l-2',
                    active
                      ? 'text-white bg-white/10 border-white'
                      : 'text-white/60 border-transparent hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  <Icon size={15} className="flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}

      {/* Déconnexion */}
      <div className="mt-auto p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white/[0.07] text-white/60 border border-white/10 rounded-full py-2 text-xs hover:bg-white/[0.14] hover:text-white transition-colors"
        >
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}





// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useSession, signOut } from 'next-auth/react';
// import { cn } from '@/lib/utils';
// import { hasAccess, ROLE_LABELS, AdminRole } from '@/lib/permissions';
// import {
//   LayoutDashboard, Package, ShoppingBag, CreditCard,
//   Truck, Users, Calendar, BarChart2, FileText,
//   Settings, LogOut, Tag, UserCog,
// } from 'lucide-react';

// const ALL_NAV = [
//   { section: 'Principal', items: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/dashboard/commandes', label: 'Commandes', icon: ShoppingBag },
//     { href: '/dashboard/produits', label: 'Catalogue', icon: Package },
//     { href: '/dashboard/categories', label: 'Catégories', icon: Tag },
//     { href: '/dashboard/paiements', label: 'Paiements', icon: CreditCard },
//     { href: '/dashboard/livraisons', label: 'Livraisons', icon: Truck },
//     { href: '/dashboard/clients', label: 'Clients', icon: Users },
//     { href: '/dashboard/cycles', label: 'Cycles', icon: Calendar },
//   ]},
//   { section: 'Analyse', items: [
//     { href: '/dashboard/rapports', label: 'Rapports', icon: BarChart2 },
//     { href: '/dashboard/logs', label: "Journal d'activité", icon: FileText },
//   ]},
//   { section: 'Administration', items: [
//     { href: '/dashboard/admins', label: 'Administrateurs', icon: UserCog },
//     { href: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
//   ]},
// ];

// export default function AdminSidebar({
//   user,
// }: {
//   user: { name: string; email: string; role: string };
// }) {
//   const pathname = usePathname();
//   const { data: session } = useSession();

//   // Utiliser le rôle depuis useSession (source la plus fiable côté client)
//   const role = (session?.user?.role || user.role || 'OPERATEUR') as AdminRole;

//   const handleLogout = () => {
//     signOut({ callbackUrl: '/login' });
//   };
  
//   return (
//     <aside className="bg-green flex flex-col sticky top-0 h-screen overflow-y-auto scrollbar-none">
//       <div className="p-4 pb-3.5 border-b border-white/10">
//         <div className="flex items-center gap-2 mb-3">
//           <div className="w-[30px] h-[30px] bg-white/15 rounded-lg flex items-center justify-center">
//             <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
//               <path d="M3 8h14M3 12h14M7 4l-2 12M13 4l2 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//             </svg>
//           </div>
//           <div>
//             <div className="font-serif text-[15px] text-white">Grenier Solidaire</div>
//             <div className="text-[10px] text-white/45">Administration</div>
//           </div>
//         </div>

//         <div className="bg-white/[0.07] rounded-xl px-3 py-2.5 flex items-center gap-2">
//           <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
//             {(session?.user?.name || user.name).slice(0, 2).toUpperCase()}
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs font-medium text-white truncate">
//               {session?.user?.name || user.name}
//             </div>
//             <div className="text-[10px] text-ocre-pale">
//               {ROLE_LABELS[role] || role}
//             </div>
//           </div>
//         </div>
//       </div>

//       {ALL_NAV.map(group => {
//         const accessibleItems = group.items.filter(item =>
//           hasAccess(role, item.href)
//         );

//         if (accessibleItems.length === 0) return null;

//         return (
//           <div key={group.section} className="pt-3">
//             <div className="text-[9px] font-medium tracking-widest uppercase text-white/30 px-4 mb-1.5">
//               {group.section}
//             </div>
//             {accessibleItems.map(item => {
//               const active =
//                 pathname === item.href ||
//                 (item.href !== '/dashboard' && pathname.startsWith(item.href));
//               const Icon = item.icon;
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={cn(
//                     'flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all border-l-2',
//                     active
//                       ? 'text-white bg-white/10 border-white'
//                       : 'text-white/60 border-transparent hover:text-white hover:bg-white/[0.06]'
//                   )}
//                 >
//                   <Icon size={15} className="flex-shrink-0" />
//                   {item.label}
//                 </Link>
//               );
//             })}
//           </div>
//         );
//       })}

//       <div className="mt-auto p-4">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center justify-center gap-2 bg-white/[0.07] text-white/60 border border-white/10 rounded-full py-2 text-xs hover:bg-white/[0.14] hover:text-white transition-colors"
//         >
//           <LogOut size={13} />
//           Déconnexion
//         </button>
//       </div>
//     </aside>
//   );
// }





// 'use client';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import { cn } from '@/lib/utils';
// import { hasAccess, ROLE_LABELS, AdminRole } from '@/lib/permissions';
// import {
//   LayoutDashboard, Package, ShoppingBag, CreditCard,
//   Truck, Users, Calendar, BarChart2, FileText,
//   Settings, LogOut, Tag, UserCog,
// } from 'lucide-react';

// // Toutes les pages du dashboard avec leur rôle minimum
// const ALL_NAV = [
//   { section: 'Principal', items: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/dashboard/commandes', label: 'Commandes', icon: ShoppingBag },
//     { href: '/dashboard/produits', label: 'Catalogue', icon: Package },
//     { href: '/dashboard/categories', label: 'Catégories', icon: Tag },
//     { href: '/dashboard/paiements', label: 'Paiements', icon: CreditCard },
//     { href: '/dashboard/livraisons', label: 'Livraisons', icon: Truck },
//     { href: '/dashboard/clients', label: 'Clients', icon: Users },
//     { href: '/dashboard/cycles', label: 'Cycles', icon: Calendar },
//   ]},
//   { section: 'Analyse', items: [
//     { href: '/dashboard/rapports', label: 'Rapports', icon: BarChart2 },
//     { href: '/dashboard/logs', label: "Journal d'activité", icon: FileText },
//   ]},
//   { section: 'Administration', items: [
//     { href: '/dashboard/admins', label: 'Administrateurs', icon: UserCog },
//     { href: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
//   ]},
// ];

// export default function AdminSidebar({
//   user,
// }: {
//   user: { name: string; email: string; role: string };
// }) {
//   const pathname = usePathname();
//   const role = user.role as AdminRole;

//   // console.log('USER COMPLET:', JSON.stringify(user));
//   // console.log('ROLE:', role);

//   const handleLogout = () => {
//     signOut({ callbackUrl: '/login' });
//   };

//   return (
//     <aside className="bg-green flex flex-col sticky top-0 h-screen overflow-y-auto scrollbar-none">
//       {/* Logo */}
//       <div className="p-4 pb-3.5 border-b border-white/10">
//         <div className="flex items-center gap-2 mb-3">
//           <div className="w-[30px] h-[30px] bg-white/15 rounded-lg flex items-center justify-center">
//             <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
//               <path d="M3 8h14M3 12h14M7 4l-2 12M13 4l2 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//             </svg>
//           </div>
//           <div>
//             <div className="font-serif text-[15px] text-white">Grenier Solidaire</div>
//             <div className="text-[10px] text-white/45">Administration</div>
//           </div>
//         </div>

//         {/* Info utilisateur connecté */}
//         <div className="bg-white/[0.07] rounded-xl px-3 py-2.5 flex items-center gap-2">
//           <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
//             {user.name.slice(0, 2).toUpperCase()}
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs font-medium text-white truncate">{user.name}</div>
//             <div className="text-[10px] text-ocre-pale">
//               {ROLE_LABELS[role] || role}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation — filtrée selon le rôle */}
//       {ALL_NAV.map(group => {
//         // Filtrer les items accessibles au rôle de l'utilisateur
//         const accessibleItems = group.items.filter(item =>
//           hasAccess(role, item.href)
//         );

//         // Ne pas afficher la section si aucun item accessible
//         if (accessibleItems.length === 0) return null;

//         return (
//           <div key={group.section} className="pt-3">
//             <div className="text-[9px] font-medium tracking-widest uppercase text-white/30 px-4 mb-1.5">
//               {group.section}
//             </div>
//             {accessibleItems.map(item => {
//               const active =
//                 pathname === item.href ||
//                 (item.href !== '/dashboard' && pathname.startsWith(item.href));
//               const Icon = item.icon;
//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={cn(
//                     'flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all border-l-2',
//                     active
//                       ? 'text-white bg-white/10 border-white'
//                       : 'text-white/60 border-transparent hover:text-white hover:bg-white/[0.06]'
//                   )}
//                 >
//                   <Icon size={15} className="flex-shrink-0" />
//                   {item.label}
//                 </Link>
//               );
//             })}
//           </div>
//         );
//       })}

//       {/* Déconnexion */}
//       <div className="mt-auto p-4">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center justify-center gap-2 bg-white/[0.07] text-white/60 border border-white/10 rounded-full py-2 text-xs hover:bg-white/[0.14] hover:text-white transition-colors"
//         >
//           <LogOut size={13} />
//           Déconnexion
//         </button>
//       </div>
//     </aside>
//   );
// }




// 'use client';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import { cn } from '@/lib/utils';
// import {
//   LayoutDashboard, Package, ShoppingBag, CreditCard,
//   Truck, Users, Calendar, BarChart2, FileText,
//   Settings, LogOut,
//   Tag,
// } from 'lucide-react';

// const NAV = [
//   { section: 'Principal', items: [
//     { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
//     { href: '/dashboard/commandes', label: 'Commandes', icon: ShoppingBag, badge: 'live' },
//     { href: '/dashboard/produits', label: 'Catalogue', icon: Package },
//     { href: '/dashboard/categories', label: 'Catégories', icon: Tag },
//     { href: '/dashboard/paiements', label: 'Paiements', icon: CreditCard },
//     { href: '/dashboard/livraisons', label: 'Livraisons', icon: Truck },
//     { href: '/dashboard/clients', label: 'Clients', icon: Users },
//     { href: '/dashboard/cycles', label: 'Cycles', icon: Calendar },
//   ]},
//   { section: 'Analyse', items: [
//     { href: '/dashboard/rapports', label: 'Rapports', icon: BarChart2 },
//     { href: '/dashboard/logs', label: 'Journal activité', icon: FileText },
//     { href: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
//   ]},
// ];

// export default function AdminSidebar({ user }: { user: { name: string; email: string; role: string } }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const handleLogout = () => {
//     signOut({ callbackUrl: '/login' });
//   };

//   return (
//     <aside className="bg-green flex flex-col sticky top-0 h-screen overflow-y-auto scrollbar-none">
//       {/* Logo */}
//       <div className="p-4 pb-3.5 border-b border-white/10">
//         <div className="flex items-center gap-2 mb-3">
//           <div className="w-[30px] h-[30px] bg-white/15 rounded-lg flex items-center justify-center">
//             <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
//               <path d="M3 8h14M3 12h14M7 4l-2 12M13 4l2 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
//             </svg>
//           </div>
//           <div>
//             <div className="font-serif text-[15px] text-white">Grenier Solidaire</div>
//             <div className="text-[10px] text-white/45">Administration</div>
//           </div>
//         </div>
//         {/* User info */}
//         <div className="bg-white/[0.07] rounded-xl px-3 py-2.5 flex items-center gap-2">
//           <div className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
//             {user.name.slice(0, 2).toUpperCase()}
//           </div>
//           <div className="min-w-0">
//             <div className="text-xs font-medium text-white truncate">{user.name}</div>
//             <div className="text-[10px] text-ocre-pale">{user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Opérateur'}</div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       {NAV.map(group => (
//         <div key={group.section} className="pt-3">
//           <div className="text-[9px] font-medium tracking-widest uppercase text-white/30 px-4 mb-1.5">
//             {group.section}
//           </div>
//           {group.items.map(item => {
//             const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
//             const Icon = item.icon;
//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-all border-l-2',
//                   active
//                     ? 'text-white bg-white/10 border-white'
//                     : 'text-white/60 border-transparent hover:text-white hover:bg-white/[0.06]'
//                 )}
//               >
//                 <Icon size={15} className="flex-shrink-0" />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </div>
//       ))}

//       {/* Logout */}
//       <div className="mt-auto p-4">
//         <button
//           onClick={handleLogout}
//           className="w-full flex items-center justify-center gap-2 bg-white/[0.07] text-white/60 border border-white/10 rounded-full py-2 text-xs hover:bg-white/[0.14] hover:text-white transition-colors"
//         >
//           <LogOut size={13} />
//           Déconnexion
//         </button>
//       </div>
//     </aside>
//   );
// }
