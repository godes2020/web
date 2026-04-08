'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const schema = z.object({
  name:    z.string().min(2, 'Введите имя (минимум 2 символа)').max(50),
  phone:   z.string().regex(/^\+7\d{10}$/, 'Формат: +7XXXXXXXXXX'),
  email:   z.string().email('Введите корректный email').transform(v => v.trim()),
  consent: z.literal(true, { message: 'Необходимо согласие' }),
});

type FormData = z.infer<typeof schema>;

interface Props {
  courseId?: string;
  courseTitle?: string;
  onSuccess?: () => void;
}

export default function ApplicationForm({ courseId, courseTitle, onSuccess }: Props) {
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // In real app: await api.post('/applications', { ...data, courseId });
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
      toast.success('Заявка отправлена!');
      onSuccess?.();
    } catch {
      toast.error('Ошибка. Попробуйте позже.');
    }
  };

  if (sent) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-[--color-primary] mb-2">Спасибо!</h3>
        <p className="text-[--color-text-muted]">
          Мы свяжемся с вами в течение 24 часов
        </p>
      </div>
    );
  }

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[--color-text]">{label}</label>
      {children}
      {error && <span className="text-[--color-accent-red] text-sm">{error}</span>}
    </div>
  );

  const inputClass = `
    w-full min-h-[52px] px-4 py-3 text-base border border-[--color-cream]
    rounded-[--radius-sm] bg-white focus:outline-none focus:border-[--color-primary]
    transition-colors
  `;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {courseTitle && (
        <div className="bg-[--color-cream]/50 rounded-[--radius-sm] p-3 text-sm">
          <span className="font-semibold">Курс: </span>{courseTitle}
        </div>
      )}

      <Field label="Ваше имя" error={errors.name?.message}>
        <input {...register('name')} className={inputClass} placeholder="Людмила" autoFocus />
      </Field>

      <Field label="Телефон" error={errors.phone?.message}>
        <input {...register('phone')} className={inputClass} type="tel" placeholder="+79001234567" />
      </Field>

      <Field label="Email" error={errors.email?.message}>
        <input {...register('email')} className={inputClass} type="email" placeholder="mail@example.ru" />
      </Field>

      <div className="flex items-start gap-3">
        <input
          {...register('consent')}
          type="checkbox"
          id="consent"
          className="mt-1 w-5 h-5 accent-[--color-primary] flex-shrink-0"
        />
        <label htmlFor="consent" className="text-sm text-[--color-text-muted]">
          Я согласна на обработку персональных данных в соответствии с{' '}
          <a href="/privacy" target="_blank" className="text-[--color-primary] underline">политикой конфиденциальности</a>
        </label>
      </div>
      {errors.consent && <p className="text-[--color-accent-red] text-sm">{errors.consent.message}</p>}

      <Button type="submit" loading={isSubmitting} fullWidth size="lg">
        Отправить заявку
      </Button>
    </form>
  );
}
