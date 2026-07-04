'use client';
import Link from 'next/link';
import { ShoppingBag, HelpCircle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';

export default function Navbar() {
  const { count } = useCart();

  return (
    <nav className="sticky top-0 z-[100] bg-bg/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between px-4 sm:px-5 h-[56px]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] bg-green rounded-lg flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
              <path d="M3 8h14M3 12h14M7 4l-2 12M13 4l2 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-serif text-[16px] text-green hidden sm:inline">Grenier Solidaire</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/comment" className="flex items-center gap-1.5 text-text-mid text-[13px] no-underline">
            <span className="hidden sm:inline">Comment ça marche</span>
            <span className="sm:hidden flex items-center justify-center w-[34px] h-[34px] rounded-full bg-green-xpale text-green">
              <HelpCircle size={17} />
            </span>
          </Link>

          <Link href="/checkout" className="flex items-center gap-1.5 bg-green text-white rounded-full px-3.5 py-1.5 text-[13px] font-medium sm:min-w-0 w-[38px] h-[38px] sm:w-auto sm:h-auto justify-center">
            <ShoppingBag size={16} className="sm:hidden" />
            <span className="hidden sm:inline">Mon grenier</span>
            <span className="bg-ocre text-white w-[18px] h-[18px] rounded-full text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
