interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold leading-[0.88] tracking-[-0.01em] text-chalk">
          {title}
        </h1>
        {description && <p className="mt-3 text-[15px] leading-relaxed text-chalk-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
