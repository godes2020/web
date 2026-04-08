'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }

    setTimeout(() => {
      const demoUser = { id: 'email-1', name: 'Пользователь', email: 'user@example.ru' };
      login('email-jwt-token', demoUser);
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(demoUser));
      setStatus('success');
      toast.success('Добро пожаловать!');
      setTimeout(() => router.replace('/dashboard'), 1500);
    }, 1500);
  }, [params, router, login]);

  return (
    <div className="text-center bg-white rounded-[20px] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-sm w-full">
      {status === 'loading' && (
        <>
          <div className="w-12 h-12 border-4 border-[#33783e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#666]">Подтверждаем вход...</p>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Вход выполнен!</h2>
          <p className="text-[#666]">Перенаправляем в личный кабинет...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Ссылка недействительна</h2>
          <p className="text-[#666] mb-4">Ссылка устарела или уже была использована</p>
          <Button href="/login">Запросить новую ссылку</Button>
        </>
      )}
    </div>
  );
}

export default function EmailVerifyPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <Suspense fallback={
        <div className="w-12 h-12 border-4 border-[#33783e] border-t-transparent rounded-full animate-spin" />
      }>
        <VerifyContent />
      </Suspense>
    </main>
  );
}
