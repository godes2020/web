'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toast';

function VkCallbackContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const code = params.get('code');
    if (!code) {
      router.replace('/login?error=vk');
      return;
    }

    setTimeout(() => {
      const demoUser = { id: 'vk-1', name: 'Пользователь ВКонтакте', email: '' };
      login('vk-jwt-token', demoUser);
      if (typeof window !== 'undefined') localStorage.setItem('user', JSON.stringify(demoUser));
      toast.success('Вы вошли через ВКонтакте!');
      router.replace('/dashboard');
    }, 1500);
  }, [params, router, login]);

  return (
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#33783e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-[#666]">Входим через ВКонтакте...</p>
    </div>
  );
}

export default function VkCallbackPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center">
      <Suspense fallback={
        <div className="w-12 h-12 border-4 border-[#33783e] border-t-transparent rounded-full animate-spin" />
      }>
        <VkCallbackContent />
      </Suspense>
    </main>
  );
}
