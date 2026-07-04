// middleware.ts — Protection des routes admin
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Routes admin API — vérifier le rôle
    if (pathname.startsWith('/api/') && pathname !== '/api/auth/') {
      // Les routes produits GET sont publiques
      if (req.method === 'GET' && (
        pathname.startsWith('/api/products') ||
        pathname.startsWith('/api/categories')
      )) {
        return NextResponse.next();
      }
    }

    // Dashboard admin — vérifier que l'utilisateur est connecté
    if (pathname.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Routes publiques — toujours autorisées
        const publicPaths = ['/', '/login', '/comment', '/remboursement', '/confirmation', '/paiement-echec'];
        if (publicPaths.some(p => pathname === p || pathname.startsWith('/checkout'))) {
          return true;
        }

        // API publiques
        if (req.method === 'GET' && (
          pathname.startsWith('/api/products') ||
          pathname.startsWith('/api/categories')
        )) {
          return true;
        }

        // Webhook Wave — toujours autorisé (signature HMAC gérée dans la route)
        if (pathname === '/api/payment/webhook') return true;

        // Tout le reste nécessite une session
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/((?!auth).*)/:path*',
  ],
};
