import { useParams } from 'react-router-dom'
import {
  getWeeklyFinalIssue,
  getWeeklyMergedIssues
} from '../utils/issueUtils'

function WeeklyMergedIssuesPage({
  magazineList,
  updateWeeklyIssueRule,
  updateWeeklyMergedIssues,
  toggleWeeklyMergedIssue,
  navigate
}) {
  const params = useParams()
  const magazineId =
    Number(params.magazineId)
  const year =
    Number(params.year)

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

  const mergedIssues =
    getWeeklyMergedIssues(
      magazine,
      year
    )

  const mergedIssueSet =
    new Set(mergedIssues)

  const issueNumbers =
    Array.from(
      { length: finalIssue },
      (_, index) => index + 1
    )

  const clearMergedIssues = () => {
    updateWeeklyMergedIssues(
      magazineId,
      year,
      []
    )
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
          合併号を全解除
        </button>
      </div>

      <div className="weekly-merged-grid">
        {issueNumbers.map((issue) => {
          const isSelected =
            mergedIssueSet.has(issue)

          return (
            <button
              key={issue}
              type="button"
              className={`weekly-merged-issue ${
                isSelected ? 'active' : ''
              }`}
              onClick={() =>
                toggleWeeklyMergedIssue(
                  magazineId,
                  year,
                  issue
                )
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
