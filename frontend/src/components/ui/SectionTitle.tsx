interface SectionTitleProps {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionTitle({ subtitle, title, description, align = 'center' }: SectionTitleProps) {
  return (
    <div className={`mb-6 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {subtitle && (
        <p className="text-teal-600 font-medium text-sm uppercase tracking-wide mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-2xl font-bold text-slate-800">
        {title}
      </h2>
      {description && (
        <p className="text-slate-500 text-sm mt-2">
          {description}
        </p>
      )}
    </div>
  );
}