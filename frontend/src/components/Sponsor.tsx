import { useState } from 'react'

/**
 * The cup's "sponsor", shown in the corner of brackets. Put the logo at
 * frontend/public/sponsor.png (or change the path here); until then the name
 * is shown instead.
 */
export const SPONSOR = {
  name: 'Colégio La Salle',
  logo: '/sponsor.png',
}

export default function Sponsor() {
  const [hasLogo, setHasLogo] = useState(true)
  return (
    <div className="flex flex-col items-center sm:items-end gap-1">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-faint">Sponsored by</p>
      {hasLogo ? (
        <img src={SPONSOR.logo} alt={SPONSOR.name} onError={() => setHasLogo(false)} className="h-10 w-auto max-w-[140px] object-contain" />
      ) : (
        <p className="font-display text-lg font-extrabold uppercase leading-none text-chalk-muted">{SPONSOR.name}</p>
      )}
    </div>
  )
}
