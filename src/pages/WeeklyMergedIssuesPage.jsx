import {
  useEffect,
  useState
} from 'react'
import { useParams } from 'react-router-dom'
import {
  getWeeklyFinalIssue,
  getWeeklyMergedIssuePairs
} from '../utils/issueUtils'

function WeeklyMergedIssuesPage({
  magazineList,
  updateWeeklyIssueRule,
  updateWeeklyMergedIssues,
  navigate
}) {
  const params = useParams()
  const magazineId =
    Number(params.magazineId)
  const year =
    Number(params.year)

  const [
    pendingIssue,
    setPendingIssue
  ] = useState(null)

  useEffect(() => {
    setPendingIssue(null)
  }, [
    magazineId,
    year
  ])

  const magazine =
    magazineList.find((item) => {
      return item.id === magazineId
    })

  if (
    !magazine ||
    magazine.frequency !== 'weekly' ||
    year < 1980 ||
    year > 2050
  ) {
    return (
      <div className="app">
        <button
          className="back-button"
          onClick={() =>
            navigate(
              `/weekly-settings/${magazineId}`
            )
          }
        >
          ← 戻る
        </button>

        <div className="title">
          週刊誌情報が見つかりません
        </div>
      </div>
    )
  }

  const finalIssue =
    getWeeklyFinalIssue(
      magazine,
      year
    )

  const mergedIssuePairs =
    getWeeklyMergedIssuePairs(
      magazine,
      year
    )

  const issueNumbers =
    Array.from(
      { length: finalIssue },
      (_, index) => index + 1
    )

  const getPairIndex = (issue) => {
    return mergedIssuePairs.findIndex(
      ([first, second]) => {
        return (
          first === issue ||
          second === issue
        )
      }
    )
  }

  const clearMergedIssues = () => {
    setPendingIssue(null)
    updateWeeklyMergedIssues(
      magazineId,
      year,
      []
    )
  }

  const handleIssueClick = (issue) => {
    const pairIndex =
      getPairIndex(issue)

    if (pairIndex >= 0) {
      setPendingIssue(null)
      updateWeeklyMergedIssues(
        magazineId,
        year,
        mergedIssuePairs.filter(
          (_, index) => {
            return index !== pairIndex
          }
        )
      )
      return
    }

    if (!pendingIssue) {
      setPendingIssue(issue)
      return
    }

    if (pendingIssue === issue) {
      setPendingIssue(null)
      return
    }

    if (
      Math.abs(
        pendingIssue - issue
      ) !== 1
    ) {
      return
    }

    updateWeeklyMergedIssues(
      magazineId,
      year,
      [
        ...mergedIssuePairs,
        [
          Math.min(pendingIssue, issue),
          Math.max(pendingIssue, issue)
        ]
      ]
    )
    setPendingIssue(null)
  }

  return (
    <div className="app">
      <div className="series-page-header">
        <button
          className="back-button"
          onClick={() =>
            navigate(
              `/weekly-settings/${magazineId}`
            )
          }
        >
          ← 戻る
        </button>

        <div className="title series-page-title">
          {year}年 合併号
        </div>

        <div />
      </div>

      <div className="weekly-merged-summary">
        <div className="weekly-merged-magazine">
          {magazine.name}
        </div>

        <div className="weekly-issue-toggle">
          <button
            type="button"
            className={
              finalIssue === 52
                ? 'active'
                : ''
            }
            onClick={() =>
              updateWeeklyIssueRule(
                magazineId,
                year,
                52
              )
            }
          >
            52号
          </button>

          <button
            type="button"
            className={
              finalIssue === 53
                ? 'active'
                : ''
            }
            onClick={() =>
              updateWeeklyIssueRule(
                magazineId,
                year,
                53
              )
            }
          >
            53号
          </button>
        </div>

        <button
          type="button"
          className="weekly-merged-clear"
          onClick={clearMergedIssues}
        >
          合併号をすべて解除
        </button>
      </div>

      <div className="weekly-merged-grid">
        {issueNumbers.map((issue) => {
          const pairIndex =
            getPairIndex(issue)

          const isPending =
            pendingIssue === issue

          const issueClassName =
            pairIndex >= 0
              ? `pair-${pairIndex % 7}`
              : isPending
                ? 'pending'
                : ''

          return (
            <button
              key={issue}
              type="button"
              className={`weekly-merged-issue ${issueClassName}`}
              onClick={() =>
                handleIssueClick(issue)
              }
            >
              {issue}号
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WeeklyMergedIssuesPage
