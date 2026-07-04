'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-green relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.04] -top-[150px] -right-[100px]" />
      <div className="absolute w-[250px] h-[250px] rounded-full bg-white/[0.04] -bottom-20 -left-[60px]" />

      <div className="bg-white rounded-3xl p-9 w-full max-w-[400px] relative z-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-[38px] h-[38px] bg-green rounded-[10px] flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" width="20" height="20">
              <path d="M3 8h14M3 12h14M7 4l-2 12M13 4l2 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="font-serif text-lg text-green">Grenier Solidaire</div>
            <div className="text-[11px] text-text-light mt-0.5">Espace administrateur</div>
          </div>
        </div>

        <div className="font-serif text-[26px] text-green mb-1.5">Connexion</div>
        <p className="text-sm text-text-mid mb-7 font-light">Accès réservé à l&apos;équipe Grenier Solidaire</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Adresse email"
            type="email"
            placeholder="admin@greniersolidaire.ci"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg px-3.5 py-2.5 text-[13px]">{error}</div>
          )}

          <Button type="submit" variant="primary" size="lg" full loading={loading}>
            Se connecter
          </Button>
        </form>

        <div className="bg-green-xpale rounded-2xl p-3.5 mt-5 text-[13px] text-text-mid flex items-center gap-2">
          <span>🔒</span>
          Session sécurisée · Expire après 8h d&apos;inactivité
        </div>
      </div>
    </div>
  );
}
