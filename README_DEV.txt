==========================================================
GRENIER SOLIDAIRE V1 — GUIDE COMPLET DÉVELOPPEUR
==========================================================

Stack  : Next.js 14 · TypeScript · Tailwind CSS
ORM    : Prisma
BDD    : Supabase (PostgreSQL)
Auth   : NextAuth.js (JWT · 8h)
Forms  : React Hook Form + Zod
Paiement : Wave CI (XOF)
Storage  : Supabase Storage (images produits)
Hébergement : Vercel + Cloudflare

----------------------------------------------------------
1. DÉMARRAGE RAPIDE
----------------------------------------------------------

  1. Installe les dépendances
       npm install

  2. Crée le fichier d'environnement
       cp .env.local.example .env.local
       → Remplis toutes les variables (voir section 3)

  3. Génère le client Prisma
       npm run prisma:generate

  4. Crée les tables dans Supabase
       npm run prisma:migrate
       (ou via Supabase SQL Editor si accès direct)

  5. Insère les données initiales
       npm run prisma:seed
       → Crée les catégories, produits, points de collecte,
         un cycle actif et le compte admin

  6. Lance le projet
       npm run dev
       → http://localhost:3000

  Accès admin :
    URL      : http://localhost:3000/login
    Email    : admin@greniersolidaire.ci
    Password : Admin@GS2025!
    ⚠ Change ce mot de passe après la première connexion !

----------------------------------------------------------
2. STRUCTURE DU PROJET
----------------------------------------------------------

grenier-solidaire/
│
├── prisma/
│   ├── schema.prisma        → Schéma BDD (11 tables)
│   ├── seed.ts              → Données initiales
│   └── migrations/          → Historique migrations
│
├── app/
│   ├── layout.tsx           → Layout racine
│   ├── globals.css          → Variables CSS
│   ├── providers.tsx        → SessionProvider + CartProvider
│   │
│   ├── (client)/            → Interface publique
│   │   ├── layout.tsx       → Navbar + FloatingWhatsApp
│   │   ├── page.tsx         → Catalogue (données réelles)
│   │   ├── checkout/        → Tunnel commande (RHF + Zod)
│   │   ├── confirmation/    → Confirmation paiement Wave
│   │   ├── paiement-echec/  → Erreur paiement + retry
│   │   ├── comment/         → Comment ça marche
│   │   └── remboursement/   → Politique remboursement
│   │
│   ├── (admin)/             → Interface admin (auth requise)
│   │   ├── login/           → Connexion NextAuth
│   │   └── dashboard/
│   │       ├── layout.tsx   → Auth check + Sidebar
│   │       ├── page.tsx     → Tableau de bord (métriques réelles)
│   │       ├── produits/    → CRUD produits + upload image
│   │       ├── commandes/   → Gestion commandes + statuts
│   │       ├── paiements/   → Transactions Wave
│   │       ├── livraisons/  → Suivi livraisons
│   │       ├── clients/     → Base clients
│   │       ├── cycles/      → Gestion cycles
│   │       ├── rapports/    → Stats + exports
│   │       ├── logs/        → Journal activité immuable
│   │       └── parametres/  → Config + intégrations
│   │
│   └── api/
│       ├── auth/[...nextauth]/ → NextAuth
│       ├── products/           → GET / POST / PATCH / DELETE
│       ├── categories/         → GET
│       ├── orders/             → GET / POST / PATCH
│       ├── cycles/             → GET / POST / PATCH (close)
│       ├── collection-points/  → GET
│       ├── deliveries/         → GET
│       ├── logs/               → GET
│       └── payment/
│           ├── create/         → POST → session Wave
│           └── webhook/        → POST → callback Wave (HMAC)
│
├── components/
│   ├── ui/                     → Composants réutilisables
│   │   ├── Button.tsx          → Bouton (5 variants)
│   │   ├── Input.tsx           → Input / Select / Textarea
│   │   ├── Modal.tsx           → Modal avec overlay
│   │   ├── Badge.tsx           → Badge / Card / Alert / MetricCard
│   │   └── DataTable.tsx       → Table + FilterTabs + TableAction
│   ├── client/
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx     → Card produit (images réelles)
│   │   └── FloatingWhatsApp.tsx
│   └── admin/
│       ├── Sidebar.tsx
│       └── Topbar.tsx
│
├── lib/
│   ├── prisma.ts              → Client Prisma singleton
│   ├── auth.ts                → Config NextAuth
│   ├── wave.ts                → Client Wave CI (checkout + webhook)
│   ├── storage.ts             → Supabase Storage (upload images)
│   ├── utils.ts               → Fonctions utilitaires
│   ├── CartContext.tsx        → Panier React Context
│   └── validations/
│       └── index.ts           → Schémas Zod (product, order, login, cycle)
│
├── hooks/
├── middleware.ts              → Protection routes admin + API
├── .env.local.example         → Modèle variables d'environnement
└── README_DEV.txt             → Ce fichier

----------------------------------------------------------
3. VARIABLES D'ENVIRONNEMENT (.env.local)
----------------------------------------------------------

  DATABASE_URL
    → Supabase > Settings > Database > Connection string
      Mode : Transaction (port 6543)

  DIRECT_URL
    → Supabase > Settings > Database > Connection string
      Mode : Session (port 5432)
    → Requis pour les migrations Prisma

  NEXT_PUBLIC_SUPABASE_URL
    → Supabase > Settings > API > Project URL

  NEXT_PUBLIC_SUPABASE_ANON_KEY
    → Supabase > Settings > API > anon / public

  SUPABASE_SERVICE_ROLE_KEY
    → Supabase > Settings > API > service_role
    ⚠ NE JAMAIS exposer côté client

  NEXTAUTH_SECRET
    → Générer avec : openssl rand -base64 32

  NEXTAUTH_URL
    → http://localhost:3000 (dev)
    → https://greniersolidaire.ci (production)

  WAVE_API_KEY
    → Portail Wave Business > Développeurs > Clés API

  WAVE_WEBHOOK_SECRET
    → Portail Wave Business > Développeurs > Webhooks > Secret

  NEXT_PUBLIC_APP_URL
    → http://localhost:3000 (dev)
    → https://greniersolidaire.ci (production)

  SUPABASE_STORAGE_BUCKET
    → product-images (nom du bucket à créer dans Supabase Storage)

----------------------------------------------------------
4. CONFIGURATION SUPABASE
----------------------------------------------------------

  Étape 1 — Créer le bucket Storage
    Supabase > Storage > New bucket
    Nom : product-images
    Public : ✅ (images accessibles sans auth)

  Étape 2 — Connexion Prisma
    Les tables sont créées via :
      npm run prisma:migrate

  Étape 3 — Vérifier les connexions
    npm run prisma:studio
    → Ouvre une interface pour visualiser les données

----------------------------------------------------------
5. CONFIGURATION WAVE CI
----------------------------------------------------------

  Dans le portail Wave Business (business.wave.com) :
    → Développeurs > Clés API > Créer une clé
    → Développeurs > Webhooks > Nouveau webhook
       URL    : https://greniersolidaire.ci/api/payment/webhook
       Events : checkout.session.completed
                checkout.session.payment_failed
       → Copier le Webhook Secret dans WAVE_WEBHOOK_SECRET

  La signature HMAC est vérifiée automatiquement dans :
    app/api/payment/webhook/route.ts
    lib/wave.ts → verifyWaveWebhookSignature()

----------------------------------------------------------
6. DÉPLOIEMENT VERCEL
----------------------------------------------------------

  1. Push ton code sur GitHub
       git add .
       git commit -m "Initial commit"
       git push origin main

  2. Connecte le repo à Vercel
       vercel.com > New Project > Import from GitHub

  3. Ajoute les variables d'environnement
       Vercel > Settings > Environment Variables
       → Toutes les variables de .env.local
       → Changer NEXTAUTH_URL et NEXT_PUBLIC_APP_URL
         par https://greniersolidaire.ci

  4. Vercel déploie automatiquement à chaque push sur main

----------------------------------------------------------
7. CONFIGURATION CLOUDFLARE
----------------------------------------------------------

  1. Ajoute greniersolidaire.ci dans Cloudflare
  2. Change les nameservers chez PlanetHoster vers Cloudflare
  3. Dans DNS : CNAME @ → cname.vercel-dns.com (proxy orange ✅)
  4. Règle importante : le webhook Wave NE DOIT PAS être
     mis en cache. Dans Cloudflare > Cache Rules :
       URL : greniersolidaire.ci/api/payment/webhook
       Action : Bypass cache

----------------------------------------------------------
8. SCHÉMA BASE DE DONNÉES (11 tables)
----------------------------------------------------------

  categories          → id, label, sortOrder
  products            → id, name, unit, category, bgColor, emoji,
                        imageUrl, detailQty, detailPrice,
                        grosQty, grosPrice, grosThreshold, active
  cycles              → id, label, opensAt, closesAt, deliveryAt, status
  collection_points   → id, name, address, zone, active
  clients             → id, name, phone, quartier, ordersCount, totalSpent
  orders              → id, orderNumber, clientId, cycleId, total,
                        status, waveSessionId, waveLaunchUrl
  order_items         → id, orderId, productId, qty, price, tier, subtotal
  transactions        → id, orderId, waveRef, waveSessionId, amount,
                        currency, status, hmacVerified, rawPayload
  deliveries          → id, orderId, mode, collectionPointId, address,
                        zone, deliveryFee, status, scheduledAt, deliveredAt
  admin_users         → id, email, passwordHash, name, role, active, lastLoginAt
  audit_logs          → id, adminId, action, target, detail, ip, createdAt

----------------------------------------------------------
9. SÉCURITÉ — CHECKLIST AVANT MISE EN PRODUCTION
----------------------------------------------------------

  □ Changer le mot de passe admin par défaut (Admin@GS2025!)
  □ Générer un NEXTAUTH_SECRET fort (openssl rand -base64 32)
  □ Vérifier que .env.local n'est pas dans le repo GitHub
  □ Activer RLS sur toutes les tables Supabase
  □ Tester le webhook Wave avec une vraie transaction
  □ Activer Cloudflare devant Vercel
  □ Règle Cloudflare : bypass cache pour /api/payment/webhook
  □ Tester le HMAC en mode production
  □ Désactiver les logs Prisma en production (log: ['error'])

----------------------------------------------------------
10. COMMANDES UTILES
----------------------------------------------------------

  npm run dev              → Lancer en dev (localhost:3000)
  npm run build            → Build production
  npm run start            → Lancer le build production
  npm run prisma:generate  → Regénérer le client Prisma
  npm run prisma:migrate   → Appliquer les migrations
  npm run prisma:studio    → Interface visuelle BDD
  npm run prisma:seed      → Insérer les données initiales

----------------------------------------------------------
11. MIGRER LA BDD (ajouter une colonne par exemple)
----------------------------------------------------------

  1. Modifier prisma/schema.prisma
  2. npm run prisma:migrate
     → Donner un nom : ex "add_product_stock"
  3. Le fichier migration est créé dans prisma/migrations/
  4. Committer le fichier de migration avec ton code

==========================================================
FIN DU GUIDE
==========================================================
