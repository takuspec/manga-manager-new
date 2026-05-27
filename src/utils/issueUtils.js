export const todayString = () => {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

export const has53Weeks = (year) => {
  const dec31 = new Date(year, 11, 31)
  const day = dec31.getDay()

  const isLeapYear =
    new Date(year, 1, 29).getMonth() === 1

  return (
    day === 4 ||
    (
      day === 5 &&
      isLeapYear
    )
  )
}

export const HARTA_RELEASE_MONTHS = [
  2,
  3,
  4,
  5,
  6,
  8,
  9,
  10,
  11,
  12
]

const HARTA_ANCHOR_YEAR = 2026
const HARTA_ANCHOR_MONTH = 5
const HARTA_ANCHOR_VOLUME = 134

export const isHartaMagazine = (magazine) => {
  return magazine?.frequency === 'harta'
}

export const isHartaReleaseMonth = (month) => {
  return HARTA_RELEASE_MONTHS.includes(month)
}

export const getHartaIssueIndexInYear = (month) => {
  return HARTA_RELEASE_MONTHS.indexOf(month)
}

export const getHartaIssueMonthByIndex = (index) => {
  return HARTA_RELEASE_MONTHS[index]
}

export const getHartaYearVolumeOffset = (
  year,
  month
) => {
  const issueIndex =
    getHartaIssueIndexInYear(month)

  const anchorIndex =
    getHartaIssueIndexInYear(
      HARTA_ANCHOR_MONTH
    )

  return (
    (year - HARTA_ANCHOR_YEAR) * 10 +
    issueIndex -
    anchorIndex
  )
}

export const getHartaVolumeFromYearMonth = (
  year,
  month
) => {
  return (
    HARTA_ANCHOR_VOLUME +
    getHartaYearVolumeOffset(year, month)
  )
}

export const getHartaYearMonthFromVolume = (
  volume
) => {
  const anchorIndex =
    getHartaIssueIndexInYear(
      HARTA_ANCHOR_MONTH
    )

  const offset =
    volume - HARTA_ANCHOR_VOLUME

  const absoluteIndex =
    anchorIndex + offset

  const year =
    HARTA_ANCHOR_YEAR +
    Math.floor(absoluteIndex / 10)

  const normalizedIndex =
    ((absoluteIndex % 10) + 10) % 10

  return {
    year,
    month: getHartaIssueMonthByIndex(
      normalizedIndex
    )
  }
}

export const getLatestHartaReleaseInfo = (
  releaseDate = 1,
  today = new Date()
) => {
  const safeReleaseDate =
    releaseDate || 1

  let year =
    today.getFullYear()

  let month =
    today.getMonth() + 1

  while (
    !isHartaReleaseMonth(month) ||
    today.getDate() < safeReleaseDate
  ) {
    month -= 1

    if (month < 1) {
      month = 12
      year -= 1
    }
  }

  return {
    year,
    month,
    issue: getHartaVolumeFromYearMonth(
      year,
      month
    )
  }
}

export const getHartaReleaseCountAfterDate = (
  baseDate,
  releaseDate = 1,
  today = new Date()
) => {
  const safeReleaseDate =
    releaseDate || 1

  let count = 0
  let year =
    baseDate.getFullYear()
  let month =
    baseDate.getMonth() + 1

  while (true) {
    month += 1

    if (month > 12) {
      month = 1
      year += 1
    }

    const candidateDate =
      new Date(
        year,
        month - 1,
        safeReleaseDate
      )

    if (candidateDate > today) {
      break
    }

    if (isHartaReleaseMonth(month)) {
      count += 1
    }
  }

  return count
}

export const isHartaSeriesPublishedInIssue = (
  series,
  volume
) => {
  const group =
    series.hartaGroup || 'ha'

  if (group === 'ha') {
    return true
  }

  const { month } =
    getHartaYearMonthFromVolume(volume)

  if (
    month === 6 ||
    month === 12
  ) {
    return true
  }

  if (group === 'ru') {
    return volume % 2 === 0
  }

  if (group === 'ta') {
    return volume % 2 === 1
  }

  return true
}

export const getIssuesPerYear = (
  magazine,
  year = new Date().getFullYear()
) => {
  if (isHartaMagazine(magazine)) {
    return 10
  }

  if (magazine.frequency === 'monthly') {
    return 12
  }

  return has53Weeks(year)
    ? 53
    : 52
}

export const getIssueSerial = (
  year,
  issue,
  magazine
) => {
  if (isHartaMagazine(magazine)) {
    return issue || 0
  }

  let total = 0

  for (let y = 2000; y < year; y++) {
    total += getIssuesPerYear(
      magazine,
      y
    )
  }

  return total + issue
}

export const formatIssue = (
  year,
  issue,
  magazine
) => {
  if (!issue || issue === 0) {
    return '未読'
  }

  if (isHartaMagazine(magazine)) {
    return `volume${issue}`
  }

  return `${year}年 ${issue}号`
}

export const formatIssueNumber = (
  issue,
  magazine
) => {
  if (!issue || issue === 0) {
    return '-'
  }

  if (isHartaMagazine(magazine)) {
    return `volume${issue}`
  }

  return `${issue}号`
}

export const getEstimatedLatestIssue = (
  magazine
) => {
  if (!magazine.baseDate) {
    if (isHartaMagazine(magazine)) {
      return getLatestHartaReleaseInfo(
        magazine.releaseDate
      ).issue
    }

    return magazine.baseIssue || 1
  }

  const baseDate =
    new Date(magazine.baseDate)

  const today =
    new Date()

  if (today < baseDate) {
    return magazine.baseIssue || 1
  }

  if (isHartaMagazine(magazine)) {
    const baseVolume =
      magazine.baseIssue ||
      HARTA_ANCHOR_VOLUME

    const releaseCount =
      getHartaReleaseCountAfterDate(
        baseDate,
        magazine.releaseDate,
        today
      )

    return baseVolume + releaseCount
  }

  if (magazine.frequency === 'monthly') {
    let months =
      (
        today.getFullYear() -
        baseDate.getFullYear()
      ) * 12 +
      (
        today.getMonth() -
        baseDate.getMonth()
      )

    if (
      today.getDate() <
      magazine.releaseDate
    ) {
      months -= 1
    }

    return Math.max(
      (magazine.baseIssue || 1) + months,
      magazine.baseIssue || 1
    )
  }

  const diffDays =
    Math.floor(
      (today - baseDate) /
        (
          1000 *
          60 *
          60 *
          24
        )
    )

  return Math.max(
    (magazine.baseIssue || 1) +
      Math.floor(diffDays / 7),
    magazine.baseIssue || 1
  )
}

export const getEstimatedLatestIssueInfo = (
  magazine
) => {
  if (isHartaMagazine(magazine)) {
    const issue =
      getEstimatedLatestIssue(magazine)

    const { year } =
      getHartaYearMonthFromVolume(issue)

    return {
      year,
      issue
    }
  }

  const estimatedIssue =
    getEstimatedLatestIssue(magazine)

  let issueYear =
    magazine.baseIssueYear ||
    new Date().getFullYear()

  let issueNumber =
    estimatedIssue

  while (
    issueNumber >
    getIssuesPerYear(
      magazine,
      issueYear
    )
  ) {
    issueNumber -= getIssuesPerYear(
      magazine,
      issueYear
    )

    issueYear += 1
  }

  return {
    year: issueYear,
    issue: issueNumber
  }
}

export const getMaxIssueNumber = (
  magazine,
  year = new Date().getFullYear()
) => {
  return getIssuesPerYear(
    magazine,
    year
  )
}

export const getNextIssue = (
  year,
  issue,
  magazine
) => {
  if (isHartaMagazine(magazine)) {
    const nextIssue =
      (issue || HARTA_ANCHOR_VOLUME) + 1

    const nextDate =
      getHartaYearMonthFromVolume(nextIssue)

    return {
      year: nextDate.year,
      issue: nextIssue
    }
  }

  const maxIssue =
    getMaxIssueNumber(
      magazine,
      year
    )

  if (issue >= maxIssue) {
    return {
      year: year + 1,
      issue: 1
    }
  }

  return {
    year: year,
    issue: issue + 1
  }
}

export const getPrevIssue = (
  year,
  issue,
  magazine
) => {
  if (isHartaMagazine(magazine)) {
    const prevIssue =
      Math.max(
        1,
        (issue || HARTA_ANCHOR_VOLUME) - 1
      )

    const prevDate =
      getHartaYearMonthFromVolume(prevIssue)

    return {
      year: prevDate.year,
      issue: prevIssue
    }
  }

  if (issue <= 1) {
    const prevYear =
      year - 1

    return {
      year: prevYear,
      issue: getMaxIssueNumber(
        magazine,
        prevYear
      )
    }
  }

  return {
    year: year,
    issue: issue - 1
  }
}

export const getNextPublishedIssue = (
  series,
  year,
  issue,
  magazine
) => {
  let next =
    getNextIssue(
      year,
      issue,
      magazine
    )

  if (!isHartaMagazine(magazine)) {
    return next
  }

  while (
    !isHartaSeriesPublishedInIssue(
      series,
      next.issue
    )
  ) {
    next =
      getNextIssue(
        next.year,
        next.issue,
        magazine
      )
  }

  return next
}

export const getPrevPublishedIssue = (
  series,
  year,
  issue,
  magazine
) => {
  let prev =
    getPrevIssue(
      year,
      issue,
      magazine
    )

  if (!isHartaMagazine(magazine)) {
    return prev
  }

  while (
    prev.issue > 1 &&
    !isHartaSeriesPublishedInIssue(
      series,
      prev.issue
    )
  ) {
    prev =
      getPrevIssue(
        prev.year,
        prev.issue,
        magazine
      )
  }

  return prev
}

export const getUnreadIssueCount = (
  series,
  magazine,
  latest
) => {
  if (
    !magazine ||
    series.status === 'completed'
  ) {
    return 0
  }

  const readYear =
    series.issueYear ||
    new Date().getFullYear()

  const latestSerial =
    getIssueSerial(
      latest.year,
      latest.issue,
      magazine
    )

  const readSerial =
    getIssueSerial(
      readYear,
      series.issue,
      magazine
    )

  if (latestSerial <= readSerial) {
    return 0
  }

  if (!isHartaMagazine(magazine)) {
    return latestSerial - readSerial
  }

  let count = 0

  for (
    let volume = readSerial + 1;
    volume <= latestSerial;
    volume += 1
  ) {
    if (
      isHartaSeriesPublishedInIssue(
        series,
        volume
      )
    ) {
      count += 1
    }
  }

  return count
}
