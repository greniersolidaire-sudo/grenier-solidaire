import Link from 'next/link';

export default function RemboursementPage() {
  const SUPPORT = '2250150656464';
  return (
    <div>
      <div className="bg-green px-4 sm:px-5 py-8">
        <div className="max-w-[680px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] text-white/80 mb-3">
            ← Retour au catalogue
          </Link>
          <h1 className="font-serif text-[clamp(24px,5vw,38px)] text-white mb-1">Politique de remboursement</h1>
          <p className="text-sm text-white/60 font-light">Vos droits et nos engagements en cas de problème</p>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 sm:px-5 py-8 pb-16">
        <div className="bg-green-xpale rounded-[20px] p-5 mb-7 border-l-[3px] border-green">
          <div className="text-[15px] font-medium text-green mb-1.5">Notre engagement</div>
          <p className="text-sm text-text-mid leading-relaxed font-light">
            Chez Grenier Solidaire, votre satisfaction est notre priorité. Si quelque chose ne va pas avec votre commande, nous nous engageons à trouver une solution rapide et équitable.
          </p>
        </div>

        <div className="font-serif text-[22px] text-green mb-4">Quand avez-vous droit à un remboursement ?</div>
        <div className="flex flex-col gap-2.5 mb-8">
          {[
            { title: 'Commande annulée par Grenier Solidaire', desc: 'Si nous annulons votre commande (rupture de stock, problème logistique), vous êtes remboursé intégralement dans les 48 heures.' },
            { title: 'Produit manquant ou incorrect', desc: 'Contactez-nous sur WhatsApp dans les 24 heures après récupération. Nous vous remboursons ou livrons le bon produit.' },
            { title: 'Produit endommagé ou défectueux', desc: 'Envoyez-nous une photo sur WhatsApp dans les 24 heures. Remboursement ou remplacement garanti.' },
          ].map(item => (
            <div key={item.title} className="bg-white border border-border rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-pale flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A3C28" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-text mb-1">{item.title}</div>
                  <p className="text-[13px] text-text-mid leading-relaxed font-light">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="font-serif text-[22px] text-green mb-4">Comment demander un remboursement ?</div>
        <div className="flex flex-col gap-2 mb-8">
          {[
            'Envoyez un message WhatsApp avec votre numéro de commande et une description du problème',
            'En cas de produit endommagé, joignez une photo',
            'Notre équipe vous répond dans les 12 heures et traite votre remboursement sous 48h via Wave CI',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-border rounded-2xl px-4 py-3.5">
              <div className="w-[26px] h-[26px] rounded-full bg-green text-white text-xs font-medium flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <p className="text-[13px] text-text-mid">{step}</p>
            </div>
          ))}
        </div>

        <div className="bg-green rounded-[20px] p-6 text-center">
          <div className="text-base font-medium text-white mb-1.5">Un problème avec votre commande ?</div>
          <div className="text-[13px] text-white/65 mb-5 font-light">Notre équipe · Lun–Sam 8h–20h</div>
          <a
            href={`https://wa.me/${SUPPORT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white rounded-full px-6 py-3 text-sm font-medium"
          >
            Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
