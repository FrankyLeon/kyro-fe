interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow ? <p className="section-accent mb-2">{eyebrow}</p> : null}
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-zinc-500 mt-1.5 max-w-lg">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
