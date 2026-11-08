import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

/** A player's name that opens their page. */
export default function PlayerLink({
  id,
  name,
  className,
}: {
  id: string
  name: string
  className?: string
}) {
  return (
    <Link
      to={`/players/${id}`}
      onClick={e => e.stopPropagation()}
      className={cn(
        'hover:text-gold underline-offset-4 decoration-gold/50 hover:underline transition-colors',
        className,
      )}
    >
      {name}
    </Link>
  )
}
