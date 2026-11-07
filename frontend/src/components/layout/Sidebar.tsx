import { NavLink } from 'react-router-dom'
import { Dices, Home, Users, Trophy, Medal, CalendarDays, Swords, ListOrdered, ScrollText } from 'lucide-react'
import { cn } from '../../lib/utils'

export const NAV_SECTIONS = [
  {
    label: '',
    links: [{ to: '/', label: 'Home', icon: Home }],
  },
  {
    label: 'Players',
    links: [
      { to: '/players', label: 'Players', icon: Users },
      { to: '/rankings', label: 'Rankings', icon: ListOrdered },
      { to: '/h2h', label: 'Head to head', icon: Swords },
    ],
  },
  {
    label: 'Cups',
    links: [
      { to: '/championships', label: 'Championships', icon: Trophy },
      { to: '/winners', label: 'Hall of fame', icon: Medal },
      { to: '/records', label: 'Records', icon: ScrollText },
      { to: '/recap', label: 'Year recap', icon: CalendarDays },
      { to: '/simulator', label: 'Cup simulator', icon: Dices },
    ],
  },
]

/** Centre-circle mark + wordmark. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className={compact ? 'w-7 h-7' : 'w-9 h-9'} aria-hidden="true">
        <circle cx="16" cy="16" r="12" fill="none" stroke="#F2C14E" strokeWidth="2.25" />
        <path d="M16 1.5v29" stroke="#F2C14E" strokeWidth="2.25" />
        <circle cx="16" cy="16" r="2.75" fill="#F2C14E" />
      </svg>
      <span
        className={cn(
          'font-display font-black leading-none tracking-[-0.01em] text-chalk',
          compact ? 'text-2xl' : 'text-[28px]',
        )}
      >
        Friends Cup
      </span>
    </div>
  )
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-turf-surface border-r border-turf-line">
      <div className="px-5 pt-7 pb-8">
        <Wordmark />
      </div>

      <nav className="flex-1 px-3 pb-6 space-y-7 overflow-y-auto scrollbar-thin" aria-label="Main">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {section.label && <p className="px-3 mb-2 text-xs font-semibold text-chalk-faint">{section.label}</p>}
            <div className="space-y-0.5">
              {section.links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-3 px-3 py-2 rounded-lg text-[15px] font-medium transition-colors',
                      isActive
                        ? 'bg-turf-raised text-chalk before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-gold'
                        : 'text-chalk-muted hover:text-chalk hover:bg-turf-raised/60',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-gold' : 'text-chalk-faint')} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

/** Compact top bar with a horizontally scrolling nav for small screens. */
export function MobileBar() {
  const links = NAV_SECTIONS.flatMap(s => s.links)
  return (
    <div className="lg:hidden sticky top-0 z-40 bg-turf-surface/95 backdrop-blur border-b border-turf-line">
      <div className="px-4 pt-4 pb-3">
        <Wordmark compact />
      </div>
      <nav className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none" aria-label="Main">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                isActive
                  ? 'bg-gold text-turf-bg border-gold'
                  : 'text-chalk-muted border-turf-line hover:text-chalk',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
