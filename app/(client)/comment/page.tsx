'use client';
import { useState } from 'react';
import Link from 'next/link';

const STEPS = [
  { title: 'Parcourez le catalogue', body: 'Chaque semaine, un nouveau catalogue de produits de grande consommation est disponible. Vous trouvez le prix au détail et le prix gros pour chaque article.' },
  { title: 'Choisissez vos quantités', body: 'Cliquez sur "Acheter" puis ajustez la quantité. Plus vous commandez, plus le prix baisse. La barre de progression vous indique combien il vous reste pour atteindre le prix gros.' },
  { title: 'Payez via Wave CI', body: 'Renseignez vos informations et choisissez votre point de collecte. Vous payez en toute sécurité via Wave CI. Aucune donnée bancaire ne transite par Grenier Solidaire.' },
  { title: 'Récupérez votre commande', body: 'Le samedi matin, récupérez votre commande au point de collecte le plus proche. Vous recevrez une facture partageable par WhatsApp ou email.' },
];

const FAQS = [
  { q: 'Dois-je créer un compte ?', a: 'Non. Pas besoin de créer un compte. Vous commandez avec juste votre nom et votre numéro WhatsApp.' },
  { q: 'Quand sont ouvertes les commandes ?', a: 'Les commandes sont ouvertes du lundi au vendredi. Le catalogue change chaque semaine. Les commandes fermées le vendredi à 23h59 sont disponibles le samedi matin.' },
  { q: 'Comment je paie ?', a: "Via Wave CI, l'application mobile que vous utilisez déjà. C'est rapide, sécurisé, et Grenier Solidaire ne voit jamais vos données bancaires." },
  { q: 'Où puis-je récupérer ma commande ?', a: 'Vous choisissez un point de collecte lors de la commande (gratuit), ou optez pour une livraison à domicile avec des frais selon votre zone.' },
  { q: 'Que se passe-t-il si je veux annuler ?', a: "Contactez-nous via WhatsApp avant la fermeture du cycle (vendredi 23h59). Après, l'annulation n'est plus possible car la commande est déjà transmise." },
];

export default function CommentPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="bg-green px-4 sm:px-5 py-8">
        <div className="max-w-[680px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/80 mb-3">
            ← Retour au catalogue
          </Link>
          <h1 className="font-serif text-[clamp(24px,5vw,38px)] text-white mb-1">Comment ça marche ?</h1>
          <p className="text-sm text-white/60 font-light">Achetez vos produits aux prix de gros en quelques étapes simples</p>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 sm:px-5 py-8 pb-16">
        <div className="flex flex-col mb-10">
          {STEPS.map((step, i) => (
            <div key={i} className={`flex gap-4 ${i < STEPS.length - 1 ? 'pb-8' : ''}`}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-green text-white flex items-center justify-center font-serif text-lg font-semibold flex-shrink-0">
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
              </div>
              <div className="pt-2.5">
                <div className="text-[17px] font-medium text-green mb-1.5">{step.title}</div>
                <div className="text-sm text-text-mid leading-relaxed font-light">{step.body}</div>
                {i === 1 && (
                  <div className="mt-3 bg-green-xpale rounded-2xl p-3.5">
                    <div className="text-xs font-medium text-green mb-1">Exemple</div>
                    <div className="text-[13px] text-text-mid">
                      Huile Dinor · 1 carton = <strong className="text-text">14 500 F</strong> (détail)<br />
                      Huile Dinor · 5 cartons+ = <strong className="text-green">12 800 F</strong> (gros) → vous économisez 8 500 F
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="font-serif text-2xl text-green mb-5">Questions fréquentes</div>
          <div className="flex flex-col gap-2.5">
            {FAQS.map((faq, i) => (
              <div key={i} onClick={() => setOpen(open === i ? null : i)} className="bg-white border border-border rounded-2xl p-4 cursor-pointer hover:border-green-soft transition-colors">
                <div className="text-sm font-medium text-text flex justify-between items-center gap-2.5">
                  {faq.q}
                  <span className={`text-lg text-text-light flex-shrink-0 transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
                </div>
                {open === i && <div className="text-[13px] text-text-mid leading-relaxed mt-2.5 font-light">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-green rounded-[20px] p-7 text-center">
          <div className="font-serif text-xl text-white mb-2">Prêt à commander ?</div>
          <div className="text-sm text-white/65 mb-5 font-light">Parcourez le catalogue et faites vos premiers achats groupés</div>
          <Link href="/" className="inline-block bg-white text-green rounded-full px-7 py-3 text-[15px] font-medium">
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
