import {
  getHartaGroupLabel,
  normalizeHartaGroup
} from '../utils/hartaGroups'

function HartaGroupBadge({
  magazine,
  series
}) {
  if (magazine?.frequency !== 'harta') {
    return null
  }

  const group =
    normalizeHartaGroup(
      series?.hartaGroup
    )

  return (
    <span
      className={`harta-group-badge harta-group-${group}`}
    >
      {getHartaGroupLabel(group)}
    </span>
  )
}

export default HartaGroupBadge
