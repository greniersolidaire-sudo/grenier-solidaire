import Navbar from '@/components/client/Navbar';
import FloatingWhatsApp from '@/components/client/FloatingWhatsApp';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <FloatingWhatsApp />
    </>
  );
}
