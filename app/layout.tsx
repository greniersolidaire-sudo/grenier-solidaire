import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: { default: 'Grenier Solidaire', template: '%s | Grenier Solidaire' },
  description: "La plateforme d'achat groupé de produits de grande consommation en Côte d'Ivoire",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://greniersolidaire.ci'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-bg text-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
