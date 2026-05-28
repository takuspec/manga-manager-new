import { useEffect, useState } from 'react'
import ImageView from '../components/ImageView'

import {
  formatIssue,
  getEstimatedLatestIssueInfo
} from '../utils/issueUtils'

function MagazineSeriesPage({
  magazineList,
  seriesList,
  viewMode,
  setViewMode,
  sortMode,
  setSortMode,
  sortDirection,
  setSortDirection,
  showCompleted,
  setShowCompleted,
  menuSeriesId,
  setMenuSeriesId,
  selectedSeriesIds,
  bulkIssueYear,
  setBulkIssueYear,
  bulkIssueValue,
  setBulkIssueValue,
  getUnreadCount,
  getEstimatedLatestIssue,
  addIssue,
  minusIssue,
  bulkAddIssue,
  bulkMinusIssue,
  bulkChangeSelectedIssue,
  toggleSeriesSelection,
  toggleStatus,
  deleteSeries,
  navigate,
  useParams
}) {
  const params = useParams()

  const magazineId =
    Number(params.magazineId)

  const selectedMagazine =
    magazineList.find((magazine) => {
      return magazine.id === magazineId
    })

  if (!selectedMagazine) {
    return (
      <div
        className="app"
        onClick={() =>
          setMenuSeriesId(null)
        }
      >
        <button
          onClick={() => navigate('/')}
        >
          ← 雑誌一覧へ
        </button>

        <div className="title">
          雑誌が見つかりません
        </div>
      </div>
    )
  }

  const estimatedLatestIssue =
    getEstimatedLatestIssueInfo(
      selectedMagazine
    )

  const yearOptions =
    Array.from(
      { length: 11 },
      (_, i) =>
        new Date().getFullYear() - 5 + i
    )

  const [
    showSeriesControls,
    setShowSeriesControls
  ] = useState(false)

  const [
    displaySeriesIds,
    setDisplaySeriesIds
  ] = useState([])

  const createSortedSeries = () => {
    return seriesList
      .filter((item) => {
        if (item.magazineId !== magazineId) {
          return false
        }

        if (
          !showCompleted &&
          item.status === 'completed'
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        let result = 0

        switch (sortMode) {
          case 'unread':
            result =
              getUnreadCount(a) -
              getUnreadCount(b)
            break

          case 'title':
            result =
              a.title.localeCompare(
                b.title,
                'ja'
              )
            break

          case 'issue':
            result =
              (
                (a.issueYear || 0) * 100 +
                (a.issue || 0)
              ) -
              (
                (b.issueYear || 0) * 100 +
                (b.issue || 0)
              )
            break

          default:
            result = 0
        }

        if (result === 0) {
          if (
            a.status !== 'completed' &&
            b.status === 'completed'
          ) {
            return -1
          }

          if (
            a.status === 'completed' &&
            b.status !== 'completed'
          ) {
            return 1
          }

          return a.title.localeCompare(
            b.title,
            'ja'
          )
        }

        return sortDirection === 'asc'
          ? result
          : result * -1        

      })
  }

  useEffect(() => {
    setDisplaySeriesIds(
      createSortedSeries().map((item) => {
        return item.id
      })
    )
  }, [
    magazineId,
    sortMode,
    sortDirection,
    showCompleted
  ])

  const displaySeries =
    displaySeriesIds
      .map((id) => {
        return seriesList.find((item) => {
          return item.id === id
        })
      })
      .filter((item) => {
        return Boolean(item)
      })

  return (
    <div className="app">

      <div className="series-page-header">

        <button
          className="back-button"
          onClick={() =>
            navigate(
              '/',
              { replace: true }
            )
          }
        >
          ← 戻る
        </button>

        <div className="title series-page-title">
          {selectedMagazine.name}
        </div>

        <button
          className="mode-button"
          onClick={() =>
            navigate(
              `/magazine/${magazineId}/add`
            )
          }
        >
          作品追加
        </button>

      </div>

      <div
        className="latest-issue-box"
        onClick={() =>
          setShowSeriesControls(
            !showSeriesControls
          )
        }
      >
        <span>
          {showSeriesControls
            ? '最新号'
            : '最新号'}
        </span>

        <strong>
          {formatIssue(
            estimatedLatestIssue.year,
            estimatedLatestIssue.issue,
            selectedMagazine
          )}
        </strong>
      </div>

      {showSeriesControls && (
        <>
          <div className="sort-row sort-row-with-button">

            <select
              value={sortMode}
              onChange={(e) =>
                setSortMode(
                  e.target.value
                )
              }
            >
              <option value="unread">
                未読順
              </option>

              <option value="title">
                作品名順
              </option>

              <option value="issue">
                読了順
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

          {viewMode === 'grid' && (

            <div className="bulk-issue-box">

              <select
                value={bulkIssueYear}
                onChange={(e) =>
                  setBulkIssueYear(
                    Number(e.target.value)
                  )
                }
              >
                {yearOptions.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}年
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="号数"
                value={bulkIssueValue}
                onChange={(e) =>
                  setBulkIssueValue(
                    e.target.value
                  )
                }
              />

              <button
                onClick={bulkChangeSelectedIssue}
              >
                選択作品を変更
              </button>

            </div>

          )}

          <div className="series-tool-row">

            <button
              className="bulk-button"
              onClick={() =>
                bulkAddIssue(magazineId)
              }
            >
              全連載 +1
            </button>

            <button
              className="minus-button"
              onClick={() =>
                bulkMinusIssue(magazineId)
              }
            >
              全連載 -1
            </button>

          </div>
        </>
      )}

      {viewMode === 'list' ? (

        displaySeries.map((item) => {
          const unreadCount =
            getUnreadCount(item)

          return (
            <div
              className={`series-list-card ${
                item.status === 'completed'
                  ? 'completed'
                  : ''
              } ${
                selectedSeriesIds.includes(
                  item.id
                )
                  ? 'selected'
                  : ''
              }`}
              key={item.id}
              onClick={(e) => {
                e.stopPropagation()

                setMenuSeriesId(
                  menuSeriesId === item.id
                    ? null
                    : item.id
                )
              }}
            >
              <div className="series-cover-small">

                <ImageView
                  imageId={item.imageId}
                  fallbackImage={item.image}
                />

              </div>

              <div className="series-info">

                <div className="series-title">
                  {item.title}
                </div>

                <div className="series-issue">
                  読了：
                  <span>
                    {formatIssue(
                      item.issueYear || new Date().getFullYear(),
                      item.issue,
                      selectedMagazine
                    )}
                  </span>
                </div>

                <div className="status-badge">
                  {item.status === 'completed'
                    ? '完結'
                    : `未読 ${unreadCount}`}
                </div>

              </div>

              <div
                className="series-step-buttons"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <button
                  onClick={() =>
                    addIssue(item.id)
                  }
                >
                  +1
                </button>

                <button
                  className="minus-button"
                  onClick={() =>
                    minusIssue(item.id)
                  }
                >
                  -1
                </button>
              </div>

              {menuSeriesId === item.id && (

                <div
                  className="series-popup-menu"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >

                  <button
                    onClick={() =>
                      navigate(
                        `/series/${item.id}`
                      )
                    }
                  >
                    編集
                  </button>

                  <button
                    onClick={() => {
                      const ok =
                        window.confirm(
                          item.status === 'completed'
                            ? '連載中に戻しますか？'
                            : 'この作品を完結にしますか？'
                        )

                      if (!ok) {
                        return
                      }

                      toggleStatus(item.id)
                      setMenuSeriesId(null)
                    }}
                  >
                    {item.status === 'completed'
                      ? '連載中に戻す'
                      : '完結にする'}
                  </button>

                  <button
                    onClick={() => {
                      const ok =
                        window.confirm(
                          `「${item.title}」を削除しますか？`
                        )

                      if (!ok) {
                        return
                      }

                      deleteSeries(item.id)
                      setMenuSeriesId(null)
                    }}
                  >
                    削除
                  </button>

                </div>
              )}

            </div>
          )
        })

      ) : (

        <div className="grid">

          {displaySeries.map((item) => (

            <div
              className={`card ${
                item.status === 'completed'
                  ? 'completed'
                  : ''
              } ${
                selectedSeriesIds.includes(
                  item.id
                )
                  ? 'selected'
                  : ''
              }`}
              key={item.id}
              onClick={() => {
                if (
                  item.status === 'completed'
                ) {
                  return
                }

                toggleSeriesSelection(
                  item.id
                )
              }}
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

              <div className="card-issue">
                {formatIssue(
                  item.issueYear ||
                    new Date().getFullYear(),
                  item.issue,
                  selectedMagazine
                )}
              </div>

              <div className="card-unread">
                {item.status === 'completed'
                  ? '完結'
                  : `未読 ${getUnreadCount(item)}`}
              </div>

            </div>
          ))}

        </div>

      )}

      <div className="bottom-nav">

        <button
          onClick={() => {
            setViewMode(
              viewMode === 'list'
                ? 'grid'
                : 'list'
            )
          }}
        >
          {viewMode === 'list'
            ? 'グリッド表示'
            : 'リスト表示'}
        </button>

        <button
          onClick={() =>
            setShowCompleted(
              !showCompleted
            )
          }
        >
          {showCompleted
            ? '完結を非表示'
            : '完結を表示'}
        </button>

      </div>

    </div>
  )
}

export default MagazineSeriesPage
