import './ui.css'

/**
 * Shared empty-state block: icon, title, optional subtitle, optional CTA.
 * `action` is a ReactNode (usually a button) rendered under the text so
 * empty states can double as calls to action.
 */
export default function EmptyState({ icon, title, subtitle, action, className = '' }) {
  return (
    <div className={`ui-empty ${className}`}>
      {icon && <span className="ui-empty__icon">{icon}</span>}
      <p className="ui-empty__title">{title}</p>
      {subtitle && <p className="ui-empty__sub">{subtitle}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  )
}
