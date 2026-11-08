import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import Spinner from './Spinner'

type Variant = 'primary' | 'ghost' | 'danger' | 'destructive' | 'subtle'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gold text-turf-bg border-gold hover:bg-[#F7CF6B] hover:border-[#F7CF6B] font-semibold',
  ghost:
    'bg-transparent text-chalk-muted border-turf-line hover:text-chalk hover:border-chalk-faint',
  danger:
    'bg-transparent text-loss border-loss/30 hover:bg-loss/10 hover:border-loss/60',
  destructive:
    'bg-loss text-turf-bg border-loss hover:bg-[#F4837A] hover:border-[#F4837A] font-semibold',
  subtle:
    'bg-turf-raised text-chalk border-turf-line hover:border-chalk-faint',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'ghost', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-medium border transition-colors cursor-pointer whitespace-nowrap',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Spinner
          className={cn(
            'w-3.5 h-3.5',
            (variant === 'primary' || variant === 'destructive') && 'border-turf-bg/20 border-t-turf-bg',
          )}
        />
      )}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
export default Button
