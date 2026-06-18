import { NavLink } from 'react-router-dom'
import { Users, Trophy, Medal, BarChart2, Swords, ListOrdered, ScrollText } from 'lucide-react'
import { cn } from '../../lib/utils'

const sections = [
  {
    label: 'Players',
    links: [
      { to: '/players', label: 'Players', icon: Users },
      { to: '/rankings', label: 'Rankings', icon: ListOrdered },
    ],
  },
  {
    label: 'Championships',
    links: [
      { to: '/championships', label: 'Championships', icon: Trophy },
      { to: '/winners', label: 'Hall of Fame', icon: Medal },
      { to: '/recap', label: 'Year Recap', icon: BarChart2 },
      { to: '/records', label: 'All-Time Records', icon: ScrollText },
    ],
  },
  {
    label: 'Analysis',
    links: [
      { to: '/h2h', label: 'Head to Head', icon: Swords },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-gh-surface border-r border-gh-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gh-border">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-lg leading-none shrink-0">
          ⚽
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-100 leading-tight">Cup Manager</p>
          <p className="text-xs text-zinc-500">Tournament dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-3 overflow-y-auto scrollbar-thin">
        {sections.map(section => (
          <div key={section.label}>
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-gh-elevated',
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
