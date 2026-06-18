import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import Spinner from './Spinner'

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-emerald-600 text-white hover:bg-emerald-500 border-transparent',
  ghost:
    'bg-transparent text-zinc-400 border-gh-border hover:text-zinc-100 hover:border-zinc-500 hover:bg-gh-elevated',
  danger:
    'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20',
  subtle:
    'bg-gh-elevated text-zinc-300 border-gh-border hover:border-zinc-500',
}

const sizes: Record<Size, string> = {
  sm: 'px-2.5 py-1 text-xs rounded',
  md: 'px-4 py-1.5 text-sm rounded-md',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border transition-colors cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-3.5 h-3.5" />}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
export default Button
