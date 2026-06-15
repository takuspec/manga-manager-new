export const todayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(
    today.getMonth() + 1
  ).padStart(2, '0')
  const date = String(
    today.getDate()
  ).padStart(2, '0')

  return `${year}-${month}-${date}`
}

const MS_PER_DAY =
  1000 * 60 * 60 * 24

const startOfDay = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  )
}

const parseLocalDate = (value) => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return startOfDay(value)
  }

  const [
    year,
    month,
    date
  ] = String(value)
    .split('-')
    .map(Number)

  if (!year || !month || !date) {
    return null
  }

  return new Date(
    year,
    month - 1,
    date
  )
}

const getLastDayOfMonth = (
  year,
  month
) => {
  return new Date(
    year,
    month,
    0
  ).getDate()
}

const getSafeReleaseDate = (
  releaseDate = 1
) => {
  const numericReleaseDate =
    Number(releaseDate) || 1

  return Math.min(
    31,
    Math.max(1, numericReleaseDate)
  )
}

const createReleaseDate = (
  year,
  month,
  releaseDate = 1
) => {
  const safeReleaseDate =
    getSafeReleaseDate(releaseDate)

  return new Date(
    year,
    month - 1,
    Math.min(
      safeReleaseDate,
      getLastDayOfMonth(year, month)
    )
  )
}

const getWeeklyReleaseCountAfterDate = (
  baseDate,
  releaseDay = 1,
  today = new Date()
) => {
  const base =
    startOfDay(baseDate)

  const current =
    startOfDay(today)

  if (current <= base) {
    return 0
  }

  const numericReleaseDay =
    Number(releaseDay)

  const safeReleaseDay =
    numericReleaseDay >= 0 &&
    numericReleaseDay <= 6
      ? numericReleaseDay
      : 1

  let daysUntilRelease =
    (
      safeReleaseDay -
      base.getDay() +
      7
    ) % 7

  if (daysUntilRelease === 0) {
    daysUntilRelease = 7
  }

  const firstReleaseDate =
    new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate() + daysUntilRelease
    )

  if (firstReleaseDate > current) {
    return 0
  }

  return (
    Math.floor(
      (
        current -
        firstReleaseDate
      ) / MS_PER_DAY / 7
    ) + 1
  )
}

const getMonthlyReleaseCountAfterDate = (
  baseDate,
  releaseDate = 1,
  today = new Date()
) => {
  const base =
    startOfDay(baseDate)

  const current =
    startOfDay(today)

  if (current <= base) {
    return 0
  }

  let count = 0
  let year =
    base.getFullYear()
  let month =
    base.getMonth() + 1

  while (
    year < current.getFullYear() ||
    (
      year === current.getFullYear() &&
      month <= current.getMonth() + 1
    )
  ) {
    const candidateDate =
      createReleaseDate(
        year,
        month,
        releaseDate
      )

    if (
      candidateDate > base &&
      candidateDate <= current
    ) {
      count += 1
    }

    month += 1

    if (month > 12) {
      month = 1
      year += 1
    }
  }

  return count
}

export const getYearOptions = () => {
  return Array.from(
    { length: 2050 - 1980 + 1 },
    (_, i) => 1980 + i
  )
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

export const getWeeklyFinalIssue = (
  magazine,
  year
) => {
  const finalIssue =
    Number(
      magazine?.weeklyIssueRules?.[year]
    )

  return finalIssue === 53
    ? 53
    : 52
}

export const DEFAULT_WEEKLY_MERGED_ISSUES = [
  [3, 4],
  [6, 7],
  [22, 23],
  [36, 37]
]

const toIssuePair = (value) => {
  if (!Array.isArray(value)) {
    return null
  }

  const first =
    Number(value[0]) || 0
  const second =
    Number(value[1]) || 0

  if (
    first <= 0 ||
    second <= 0 ||
    Math.abs(first - second) !== 1
  ) {
    return null
  }

  return [
    Math.min(first, second),
    Math.max(first, second)
  ]
}

export const normalizeWeeklyMergedIssuePairs = (
  issues,
  magazine,
  year
) => {
  const finalIssue =
    getWeeklyFinalIssue(
      magazine,
      year
    )

  if (!Array.isArray(issues)) {
    return []
  }

  const pairs =
    issues.every(Array.isArray)
      ? issues
          .map(toIssuePair)
          .filter(Boolean)
      : []

  if (!issues.every(Array.isArray)) {
    const numbers =
      Array.from(
        new Set(
          issues
            .map((issue) => {
              return Number(issue) || 0
            })
            .filter((issue) => {
              return issue > 0
            })
        )
      ).sort((a, b) => {
        return a - b
      })

    for (let i = 0; i < numbers.length - 1; i += 1) {
      if (numbers[i + 1] === numbers[i] + 1) {
        pairs.push([
          numbers[i],
          numbers[i + 1]
        ])
        i += 1
      }
    }
  }

  const usedIssues =
    new Set()

  return pairs
    .filter(([first, second]) => {
      if (
        first < 1 ||
        second > finalIssue ||
        usedIssues.has(first) ||
        usedIssues.has(second)
      ) {
        return false
      }

      usedIssues.add(first)
      usedIssues.add(second)
      return true
    })
    .sort((a, b) => {
      return a[0] - b[0]
    })
}

export const getWeeklyMergedIssuePairs = (
  magazine,
  year
) => {
  const hasManualIssues =
    Object.prototype.hasOwnProperty.call(
      magazine?.weeklyMergedIssues || {},
      year
    )

  const issues =
    magazine?.weeklyMergedIssues?.[year]

  return normalizeWeeklyMergedIssuePairs(
    hasManualIssues
      ? issues
      : DEFAULT_WEEKLY_MERGED_ISSUES,
    magazine,
    year
  )
}

export const getWeeklyMergedIssues = (
  magazine,
  year
) => {
  return getWeeklyMergedIssuePairs(
    magazine,
    year
  )
}

export const getWeeklyMergedPairForIssue = (
  magazine,
  year,
  issue
) => {
  const numericIssue =
    Number(issue) || 0

  return (
    getWeeklyMergedIssuePairs(
      magazine,
      year
    ).find(([first, second]) => {
      return (
        first === numericIssue ||
        second === numericIssue
      )
    }) || null
  )
}

const getWeeklyIssueSerialCount = (
  magazine,
  year
) => {
  return (
    getWeeklyFinalIssue(
      magazine,
      year
    ) -
    getWeeklyMergedIssuePairs(
      magazine,
      year
    ).length
  )
}

const getWeeklyIssueSerialInYear = (
  magazine,
  year,
  issue
) => {
  const numericIssue =
    Number(issue) || 0

  const mergedSecondHalfCount =
    getWeeklyMergedIssuePairs(
      magazine,
      year
    ).filter(([, second]) => {
      return second <= numericIssue
    }).length

  return (
    numericIssue -
    mergedSecondHalfCount
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
  let year =
    today.getFullYear()

  let month =
    today.getMonth() + 1

  const current =
    startOfDay(today)

  while (true) {
    const releaseDay =
      createReleaseDate(
        year,
        month,
        releaseDate
      )

    if (
      isHartaReleaseMonth(month) &&
      releaseDay <= current
    ) {
      break
    }

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
  const base =
    startOfDay(baseDate)

  const current =
    startOfDay(today)

  if (current <= base) {
    return 0
  }

  let year =
    base.getFullYear()
  let month =
    base.getMonth() + 1
  let count = 0

  while (
    year < current.getFullYear() ||
    (
      year === current.getFullYear() &&
      month <= current.getMonth() + 1
    )
  ) {
    const candidateDate =
      createReleaseDate(
        year,
        month,
        releaseDate
      )

    if (
      isHartaReleaseMonth(month) &&
      candidateDate > base &&
      candidateDate <= current
    ) {
      count += 1
    }

    month += 1

    if (month > 12) {
      month = 1
      year += 1
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

  return getWeeklyFinalIssue(
    magazine,
    year
  )
}

export const getIssueOptions = (
  magazine,
  year = new Date().getFullYear(),
  {
    includeUnread = false,
    unreadLabel = '未読'
  } = {}
) => {
  const options = []

  if (includeUnread) {
    options.push({
      value: 0,
      label: unreadLabel
    })
  }

  if (!magazine) {
    return options
  }

  if (isHartaMagazine(magazine)) {
    return options
  }

  const maxIssue =
    getIssuesPerYear(
      magazine,
      Number(year) ||
        new Date().getFullYear()
    )

  for (let issue = 1; issue <= maxIssue; issue += 1) {
    options.push({
      value: issue,
      label: String(issue)
    })
  }

  return options
}

export const clampIssueForYear = (
  magazine,
  year,
  issue,
  {
    includeUnread = false
  } = {}
) => {
  const numericIssue =
    Number(issue) || 0

  if (!magazine) {
    return numericIssue
  }

  if (isHartaMagazine(magazine)) {
    return numericIssue
  }

  if (includeUnread && numericIssue === 0) {
    return 0
  }

  const maxIssue =
    getIssuesPerYear(
      magazine,
      Number(year) ||
        new Date().getFullYear()
    )

  if (numericIssue <= 0) {
    return includeUnread ? 0 : 1
  }

  return Math.min(
    numericIssue,
    maxIssue
  )
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

  for (let y = 1980; y < year; y++) {
    total +=
      magazine?.frequency === 'weekly'
        ? getWeeklyIssueSerialCount(
            magazine,
            y
          )
        : getIssuesPerYear(
            magazine,
            y
          )
  }

  if (magazine?.frequency === 'weekly') {
    return (
      total +
      getWeeklyIssueSerialInYear(
        magazine,
        year,
        issue
      )
    )
  }

  return total + issue
}

export const getIssueSpanCount = (
  magazine,
  startYear,
  startIssue,
  endYear,
  endIssue
) => {
  const normalizedStartIssue =
    Number(startIssue) || 0

  const normalizedEndIssue =
    Number(endIssue) || 0

  if (
    !magazine ||
    !normalizedStartIssue ||
    !normalizedEndIssue
  ) {
    return 0
  }

  const startSerial =
    getIssueSerial(
      Number(startYear) ||
        new Date().getFullYear(),
      normalizedStartIssue,
      magazine
    )

  const endSerial =
    getIssueSerial(
      Number(endYear) ||
        Number(startYear) ||
        new Date().getFullYear(),
      normalizedEndIssue,
      magazine
    )

  if (endSerial < startSerial) {
    return 0
  }

  return Math.max(
    1,
    endSerial - startSerial + 1
  )
}

export const formatIssueSpanPeriod = (
  magazine,
  spanCount,
  startYear = new Date().getFullYear()
) => {
  const normalizedSpanCount =
    Number(spanCount) || 0

  if (isHartaMagazine(magazine)) {
    return `${normalizedSpanCount}号分`
  }

  if (magazine?.frequency === 'monthly') {
    const years =
      Math.floor(normalizedSpanCount / 12)
    const months =
      normalizedSpanCount % 12

    return `${years}年${months}か月`
  }

  if (magazine?.frequency === 'weekly') {
    let years = 0
    let weeks = normalizedSpanCount
    let currentYear =
      Number(startYear) ||
      new Date().getFullYear()

    while (weeks > 0) {
      const yearIssueCount =
        getWeeklyIssueSerialCount(
          magazine,
          currentYear
        )

      if (
        !yearIssueCount ||
        weeks < yearIssueCount
      ) {
        break
      }

      weeks -= yearIssueCount
      years += 1
      currentYear += 1
    }

    return `${years}年${weeks}週`
  }

  return `${normalizedSpanCount}号分`
}

export const formatIssue = (
  year,
  issue,
  magazine
) => {
  return formatIssueLabel(
    magazine,
    year,
    issue
  )
}

export const formatIssueNumber = (
  issue,
  magazine,
  year
) => {
  if (!issue || issue === 0) {
    return '-'
  }

  if (isHartaMagazine(magazine)) {
    return `volume ${issue}`
  }

  const weeklyMergedPair =
    magazine?.frequency === 'weekly'
      ? getWeeklyMergedPairForIssue(
          magazine,
          year,
          issue
        )
      : null

  const issueText =
    weeklyMergedPair
      ? `${weeklyMergedPair[0]}\u30fb${weeklyMergedPair[1]}`
      : String(issue)

  const suffix =
    magazine?.frequency === 'monthly'
      ? '月号'
      : '号'

  return `${issueText}${suffix}`
}

const getIssueNumberTextForDisplay = (
  magazine,
  year,
  issue
) => {
  const weeklyMergedPair =
    magazine?.frequency === 'weekly'
      ? getWeeklyMergedPairForIssue(
          magazine,
          year,
          issue
        )
      : null

  return weeklyMergedPair
    ? `${weeklyMergedPair[0]}\u30fb${weeklyMergedPair[1]}`
    : String(issue)
}

export const formatIssueLabelParts = (
  magazine,
  year,
  issue
) => {
  const numericIssue =
    Number(issue) || 0

  if (!numericIssue) {
    return {
      isUnread: true,
      label: '未読',
      yearText: '',
      numberText: '',
      suffixText: ''
    }
  }

  if (isHartaMagazine(magazine)) {
    return {
      isUnread: false,
      label: '',
      yearText: 'volume',
      numberText: getIssueNumberTextForDisplay(
        magazine,
        year,
        numericIssue
      ),
      suffixText: ''
    }
  }

  return {
    isUnread: false,
    label: '',
    yearText: `${year || '----'}年`,
    numberText: getIssueNumberTextForDisplay(
      magazine,
      year,
      numericIssue
    ),
    suffixText:
      magazine?.frequency === 'monthly'
        ? '月号'
        : '号'
  }
}

export const formatIssueLabel = (
  magazine,
  year,
  issue
) => {
  const parts =
    formatIssueLabelParts(
      magazine,
      year,
      issue
    )

  if (parts.isUnread) {
    return parts.label
  }

  if (isHartaMagazine(magazine)) {
    return `${parts.yearText} ${parts.numberText}${parts.suffixText}`
  }

  return `${parts.yearText}${parts.numberText}${parts.suffixText}`
}

export const getEstimatedLatestIssue = (
  magazine,
  targetDate = new Date()
) => {
  if (!magazine.baseDate) {
    if (isHartaMagazine(magazine)) {
      return getLatestHartaReleaseInfo(
        magazine.releaseDate,
        targetDate
      ).issue
    }

    return magazine.baseIssue || 1
  }

  const baseDate =
    parseLocalDate(magazine.baseDate)

  const today =
    startOfDay(targetDate)

  if (!baseDate) {
    return magazine.baseIssue || 1
  }

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
    const releaseCount =
      getMonthlyReleaseCountAfterDate(
        baseDate,
        magazine.releaseDate,
        today
      )

    return Math.max(
      (magazine.baseIssue || 1) +
        releaseCount,
      magazine.baseIssue || 1
    )
  }

  const releaseCount =
    getWeeklyReleaseCountAfterDate(
      baseDate,
      magazine.releaseDay,
      today
    )

  let latest = {
    year:
      magazine.baseIssueYear ||
      new Date().getFullYear(),
    issue: magazine.baseIssue || 1
  }

  for (
    let count = 0;
    count < releaseCount;
    count += 1
  ) {
    latest =
      getNextWeeklyReleaseIssue(
        latest.year,
        latest.issue,
        magazine
      )
  }

  return latest.issue
}

const getNextWeeklyReleaseIssue = (
  year,
  issue,
  magazine
) => {
  const mergedPair =
    getWeeklyMergedPairForIssue(
      magazine,
      year,
      issue
    )

  if (
    mergedPair &&
    issue === mergedPair[0]
  ) {
    return {
      year,
      issue: mergedPair[1]
    }
  }

  return getNextIssue(
    year,
    issue,
    magazine
  )
}

export const getEstimatedLatestIssueInfo = (
  magazine,
  targetDate = new Date()
) => {
  if (isHartaMagazine(magazine)) {
    const issue =
      getEstimatedLatestIssue(
        magazine,
        targetDate
      )

    const { year } =
      getHartaYearMonthFromVolume(issue)

    return {
      year,
      issue
    }
  }

  if (
    magazine?.frequency === 'weekly' &&
    magazine.baseDate
  ) {
    const baseDate =
      parseLocalDate(magazine.baseDate)

    const today =
      startOfDay(targetDate)

    if (baseDate && today >= baseDate) {
      const releaseCount =
        getWeeklyReleaseCountAfterDate(
          baseDate,
          magazine.releaseDay,
          today
        )

      let latest = {
        year:
          magazine.baseIssueYear ||
          new Date().getFullYear(),
        issue: magazine.baseIssue || 1
      }

      for (
        let count = 0;
        count < releaseCount;
        count += 1
      ) {
        latest =
          getNextWeeklyReleaseIssue(
            latest.year,
            latest.issue,
            magazine
          )
      }

      return latest
    }
  }

  const estimatedIssue =
    getEstimatedLatestIssue(
      magazine,
      targetDate
    )

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

  if (magazine?.frequency === 'weekly') {
    const mergedPair =
      getWeeklyMergedPairForIssue(
        magazine,
        year,
        issue
      )

    if (mergedPair) {
      const nextIssue =
        mergedPair[1] + 1

      if (nextIssue > maxIssue) {
        return {
          year: year + 1,
          issue: 1
        }
      }

      return {
        year,
        issue: nextIssue
      }
    }
  }

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

    const prevIssue =
      getMaxIssueNumber(
        magazine,
        prevYear
      )

    if (magazine?.frequency === 'weekly') {
      const prevMergedPair =
        getWeeklyMergedPairForIssue(
          magazine,
          prevYear,
          prevIssue
        )

      if (prevMergedPair) {
        return {
          year: prevYear,
          issue: prevMergedPair[0]
        }
      }
    }

    return {
      year: prevYear,
      issue: prevIssue
    }
  }

  if (magazine?.frequency === 'weekly') {
    const prevIssue =
      issue - 1

    const prevMergedPair =
      getWeeklyMergedPairForIssue(
        magazine,
        year,
        prevIssue
      )

    if (prevMergedPair) {
      return {
        year,
        issue: prevMergedPair[0]
      }
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

  const completedIssue =
    Number(series.completedIssue) || 0

  const target =
    completedIssue > 0
      ? {
          year:
            series.completedIssueYear ||
            series.issueYear ||
            latest.year,
          issue: completedIssue
        }
      : latest

  const targetSerial =
    getIssueSerial(
      target.year,
      target.issue,
      magazine
    )

  const readSerial =
    getIssueSerial(
      readYear,
      series.issue,
      magazine
    )

  const isUnread =
    (Number(series.issue) || 0) === 0

  const startIssue =
    Number(series.startIssue) || 0

  const startSerial =
    startIssue
      ? getIssueSerial(
          series.startIssueYear ||
            readYear,
          startIssue,
          magazine
        )
      : 0

  const effectiveReadSerial =
    isUnread && startSerial
      ? startSerial - 1
      : startSerial
        ? Math.max(
            readSerial,
            startSerial - 1
          )
        : readSerial

  if (targetSerial <= effectiveReadSerial) {
    return 0
  }

  if (!isHartaMagazine(magazine)) {
    return targetSerial - effectiveReadSerial
  }

  let count = 0

  for (
    let volume = effectiveReadSerial + 1;
    volume <= targetSerial;
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
