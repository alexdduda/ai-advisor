import './ui.css'

/**
 * Small status pill. Variants map onto theme.css semantic palettes:
 * default | accent | success | warning | error | info.
 */
export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`}>
      {children}
    </span>
  )
}
