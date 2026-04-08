interface Props {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;  // для тёмного фона: заголовок золотой, подзаголовок белый
}

export default function SectionTitle({ title, subtitle, center, light }: Props) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      <h2
        className="mb-3"
        style={{
          fontSize: 'var(--font-size-2xl)',
          color: light ? '#ffffff' : 'var(--color-text)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}
          style={{
            fontSize: 'var(--font-size-lg)',
            color: light ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)',
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-4 h-[3px] w-16 rounded-full ${center ? 'mx-auto' : ''}`}
        style={{ backgroundColor: light ? 'rgba(255,255,255,0.4)' : 'var(--color-gold)' }}
      />
    </div>
  );
}
