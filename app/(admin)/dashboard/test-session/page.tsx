'use client';
import { useSession } from 'next-auth/react';

export default function TestPage() {
  const { data: session, status } = useSession();
  return (
    <div style={{ padding: 40, fontFamily: 'monospace' }}>
      <h2>Status: {status}</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}