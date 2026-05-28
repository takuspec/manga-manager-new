import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ImageView from '../components/ImageView'
import {
  formatIssueNumber
} from '../utils/issueUtils'

function CompletedSeriesPage({
  magazineList,
  seriesList,
  navigate
}) {
  const params = useParams()

  const magazineId =
    Number(params.magazineId)

  const magazine =
    magazineList.find((item) => {
      return item.id === magazineId
    })

  const [sortMode, setSortMode] =
  useState('title')

  const [sortDirection, setSortDirection] =
  useState('asc')

  const isHarta =
    magazine?.frequency === 'harta'

  if (!magazine) {
    return (
      <div className="app">

        <button
          onClick={() =>
            navigate('/completed')
          }
        >
          ← 戻る
        </button>

        <div className="title">
          雑誌が見つかりません
        </div>

      </div>
    )
  }

    const completedSeries =
    seriesList
        .filter((item) => {
        return (
            item.magazineId === magazineId &&
            item.status === 'completed'
        )
        })
        .sort((a, b) => {
        let result = 0

        if (sortMode === 'title') {
            result =
            a.title.localeCompare(
                b.title,
                'ja'
            )
        }

        if (sortMode === 'start') {
            const aStart =
            (a.startIssueYear || 0) * 100 +
            (a.startIssue || 0)

            const bStart =
            (b.startIssueYear || 0) * 100 +
            (b.startIssue || 0)

            result = aStart - bStart
        }

        if (sortMode === 'end') {
            const aEnd =
            (a.issueYear || 0) * 100 +
            (a.issue || 0)

            const bEnd =
            (b.issueYear || 0) * 100 +
            (b.issue || 0)

            result = aEnd - bEnd
        }

        return sortDirection === 'asc'
            ? result
            : result * -1
        })

  return (
    <div className="app">

      <div className="series-page-header">

        <button
          className="back-button"
          onClick={() =>
            navigate('/completed')
          }
        >
          ← 戻る
        </button>

        <div className="title series-page-title">
        {magazine.name}
        </div>

        <div />

        </div>

        <div className="sort-row sort-row-with-button">

        <select
            value={sortMode}
            onChange={(e) =>
            setSortMode(e.target.value)
            }
        >
            <option value="title">
            タイトル順
            </option>

            <option value="start">
            開始日順
            </option>

            <option value="end">
            終了日順
            </option>
        </select>

        <button
            onClick={() =>
            setSortDirection(
                sortDirection === 'asc'
                ? 'desc'
                : 'asc'
            )
            }
        >
            {sortDirection === 'asc'
            ? '昇順'
            : '降順'}
        </button>

        </div>

        <div className="grid">

        {completedSeries.map((item) => (

            <div
            className="card"
            key={item.id}
            >

            <div className="cover">

              <ImageView
                imageId={item.imageId}
                fallbackImage={item.image}
              />

            </div>

            <div className="card-title">
              {item.title}
            </div>

            <div
              className={`completed-issue-row ${
                isHarta ? 'harta' : ''
              }`}
            >
                <span className="completed-issue-label">
                    開始
                </span>

                <span className="completed-issue-year">
                    {isHarta
                      ? 'volume'
                      : `${item.startIssueYear || '----'}年`}
                </span>

                <span className="completed-issue-number">
                    {isHarta ? (
                      <span className="completed-issue-volume">
                        {item.startIssue || '-'}
                      </span>
                    ) : (
                      formatIssueNumber(
                        item.startIssue,
                        magazine
                      )
                    )}
                </span>
                </div>

                <div
                  className={`completed-issue-row ${
                    isHarta ? 'harta' : ''
                  }`}
                >
                <span className="completed-issue-label">
                    終了
                </span>

                <span className="completed-issue-year">
                    {isHarta
                      ? 'volume'
                      : `${item.issueYear || '----'}年`}
                </span>

                <span className="completed-issue-number">
                    {isHarta ? (
                      <span className="completed-issue-volume">
                        {item.issue || '-'}
                      </span>
                    ) : (
                      formatIssueNumber(
                        item.issue,
                        magazine
                      )
                    )}
                </span>
            </div>
          </div>
        ))}

      </div>

      <div className="bottom-nav">

        <button
          onClick={() =>
            navigate('/')
          }
        >
          雑誌
        </button>

        <button
          onClick={() =>
            navigate('/completed')
          }
        >
          完結
        </button>

      </div>

    </div>
  )
}

export default CompletedSeriesPage
