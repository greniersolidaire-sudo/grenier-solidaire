import { Suspense } from 'react';
import PaiementEchecContent from './PaiementEchecContent';

export default function PaiementEchecPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-light animate-pulse">Chargement…</div>}>
      <PaiementEchecContent />
    </Suspense>
  );
}



// 'use client';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';

// export default function PaiementEchecPage() {
//   const params = useSearchParams();
//   const orderId = params.get('order');

//   const retry = async () => {
//     if (!orderId) return;
//     const res = await fetch('/api/payment/create', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ orderId }),
//     });
//     const data = await res.json();
//     if (data.waveLaunchUrl) window.location.href = data.waveLaunchUrl;
//   };

//   return (
//     <div className="max-w-[400px] mx-auto px-5 py-16 text-center">
//       <div className="w-[72px] h-[72px] rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
//         <span className="text-3xl">❌</span>
//       </div>
//       <h1 className="font-serif text-2xl text-red-700 mb-2">Paiement échoué</h1>
//       <p className="text-sm text-text-mid leading-relaxed mb-7 font-light">
//         Votre paiement n&apos;a pas pu être traité. Votre commande est toujours enregistrée.
//         Vous pouvez réessayer ou nous contacter.
//       </p>
//       <div className="flex flex-col gap-3">
//         {orderId && (
//           <button onClick={retry} className="w-full bg-green text-white rounded-full py-3.5 text-[15px] font-medium">
//             Réessayer le paiement
//           </button>
//         )}
//         <a
//           href={`https://wa.me/2250150656464?text=${encodeURIComponent(`Bonjour, j'ai un problème avec mon paiement. Commande : ${orderId}`)}`}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="w-full bg-[#25D366] text-white rounded-full py-3.5 text-[15px] font-medium text-center"
//         >
//           Contacter le support
//         </a>
//         <Link href="/" className="text-sm text-text-mid underline">Retour au catalogue</Link>
//       </div>
//     </div>
//   );
// }
