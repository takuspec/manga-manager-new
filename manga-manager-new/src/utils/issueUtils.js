export const todayString = () => {
  return new Date()
    .toISOString()
    .slice(0, 10)
}

export const getIssuesPerYear = (
  magazine
) => {
  return magazine.frequency === 'monthly'
    ? 12
    : 52
}

export const getIssueSerial = (
  year,
  issue,
  magazine
) => {
  return (
    year *
      getIssuesPerYear(
        magazine
      ) +
    issue
  )
}

export const formatIssue = (
  year,
  issue
) => {
  if (!issue || issue === 0) {
    return '未読'
  }

  return `${year}年 ${issue}号`
}

export const getEstimatedLatestIssue = (
  magazine
) => {
  if (!magazine.baseDate) {
    return (
      magazine.baseIssue || 1
    )
  }

  const baseDate =
    new Date(
      magazine.baseDate
    )

  const today =
    new Date()

  if (today < baseDate) {
    return (
      magazine.baseIssue || 1
    )
  }

  if (
    magazine.frequency ===
    'monthly'
  ) {
    let months =
      (
        today.getFullYear() -
        baseDate.getFullYear()
      ) *
        12 +
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
      (
        magazine.baseIssue ||
        1
      ) + months,
      magazine.baseIssue ||
        1
    )
  }

  const diffDays =
    Math.floor(
      (
        today -
        baseDate
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    )

  return Math.max(
    (
      magazine.baseIssue ||
      1
    ) +
      Math.floor(
        diffDays / 7
      ),
    magazine.baseIssue ||
      1
  )
}

export const getEstimatedLatestIssueInfo =
  (magazine) => {
    const estimatedIssue =
      getEstimatedLatestIssue(
        magazine
      )

    const currentYear =
      new Date()
        .getFullYear()

    const issuesPerYear =
      getIssuesPerYear(
        magazine
      )

    const issueYear =
      currentYear +
      Math.floor(
        (
          estimatedIssue -
          1
        ) /
          issuesPerYear
      )

    const issueNumber =
      (
        (
          estimatedIssue -
          1
        ) %
          issuesPerYear
      ) + 1

    return {
      year: issueYear,
      issue: issueNumber
    }
  }