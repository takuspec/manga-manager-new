export const HARTA_GROUP_OPTIONS = [
  {
    value: 'ha',
    label: 'は'
  },
  {
    value: 'ru',
    label: 'る'
  },
  {
    value: 'ta',
    label: 'た'
  }
]

export const normalizeHartaGroup = (value) => {
  if (
    value === 'ru' ||
    value === 'る'
  ) {
    return 'ru'
  }

  if (
    value === 'ta' ||
    value === 'た'
  ) {
    return 'ta'
  }

  return 'ha'
}

export const getHartaGroupLabel = (value) => {
  const normalizedValue =
    normalizeHartaGroup(value)

  const option =
    HARTA_GROUP_OPTIONS.find((item) => {
      return item.value === normalizedValue
    })

  return option?.label || 'は'
}
