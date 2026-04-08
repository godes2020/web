import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-[#ead4a1] mb-4">404</div>
        <h1 className="text-3xl font-bold text-[#0b140c] mb-3">Страница не найдена</h1>
        <p className="text-[#666] mb-8 max-w-md">
          Возможно, страница была перемещена или удалена. Вернитесь на главную.
        </p>
        <Button href="/" size="lg">На главную</Button>
      </div>
    </main>
  );
}
