import AnonymousIcon from './AnonymousIcon'
import PublicIcon from './PublicIcon'

interface AnonymousIconWrapperProps {
  texty?: boolean
}

export function AnonymousIconWrapper({
  texty = false,
}: AnonymousIconWrapperProps) {
  return (
    <div
      className="flex items-center gap-1 p-2"
      style={{ backgroundColor: '#FFEECE', borderRadius: '999px' }}
    >
      <AnonymousIcon />
      {texty && (
        <span className="text-xs" style={{ color: '#DC8F00' }}>
          Anonymous Voting
        </span>
      )}
    </div>
  )
}

export function PublicIconWrapper({
  texty = false,
}: AnonymousIconWrapperProps) {
  return (
    <div
      className="flex items-center gap-1 p-2"
      style={{ backgroundColor: '#CEE2FF', borderRadius: '999px' }}
    >
      <PublicIcon />
      {texty && (
        <span className="text-xs" style={{ color: '#0025DC' }}>
          Public Voting
        </span>
      )}
    </div>
  )
}
