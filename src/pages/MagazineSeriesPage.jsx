import { useEffect, useState } from 'react'
import ImageView from '../components/ImageView'

import {
  formatIssue,
  getYearOptions,
  getEstimatedLatestIssueInfo,
  getIssueSerial
} from '../utils/issueUtils'

const viewModeOptions = [
  {
    value: 'list',
    label: 'リスト'
  },
  {
    value: 'grid',
    label: 'グリッド'
  },
  {
    value: 'compact',
    label: '簡易'
  }
]

const viewModeLabelMap = {
  list: 'リスト',
  grid: 'グリッド',
  compact: '簡易'
}

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
  setSelectedSeriesIds,
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
    getYearOptions()

  const [
    showSeriesControls,
    setShowSeriesControls
  ] = useState(false)

  const [
    isViewModeMenuOpen,
    setIsViewModeMenuOpen
  ] = useState(false)

  const [
    displaySeriesIds,
    setDisplaySeriesIds
  ] = useState([])

  const getSafeIssueSerial = (
    year,
    issue
  ) => {
    const normalizedIssue =
      Number(issue) || 0

    if (!normalizedIssue) {
      return 0
    }

    const normalizedYear =
      Number(year) ||
      new Date().getFullYear()

    return getIssueSerial(
      normalizedYear,
      normalizedIssue,
      selectedMagazine
    )
  }

  const shouldShowStartIssue =
    sortMode === 'start'

  const getReadIssueText = (item) => {
    return formatIssue(
      item.issueYear ||
        new Date().getFullYear(),
      item.issue,
      selectedMagazine
    )
  }

  const getStartIssueText = (item) => {
    const startIssue =
      Number(item.startIssue) || 0

    if (!startIssue) {
      return '-'
    }

    return formatIssue(
      item.startIssueYear ||
        new Date().getFullYear(),
      startIssue,
      selectedMagazine
    )
  }

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
              (a.title || '').localeCompare(
                b.title || '',
                'ja'
              )
            break

          case 'issue':
          case 'read':
            result =
              getSafeIssueSerial(
                a.issueYear,
                a.issue
              ) -
              getSafeIssueSerial(
                b.issueYear,
                b.issue
              )
            break

          case 'start':
            result =
              getSafeIssueSerial(
                a.startIssueYear,
                a.startIssue
              ) -
              getSafeIssueSerial(
                b.startIssueYear,
                b.startIssue
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

          return (a.title || '').localeCompare(
            b.title || '',
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
        if (!item) {
          return false
        }

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

  const selectableDisplaySeriesIds =
    displaySeries
      .filter((item) => {
        return item.status !== 'completed'
      })
      .map((item) => {
        return item.id
      })

  const areAllDisplaySeriesSelected =
    selectableDisplaySeriesIds.length > 0 &&
    selectableDisplaySeriesIds.every((id) => {
      return selectedSeriesIds.includes(id)
    })

  const toggleDisplaySeriesSelection = () => {
    if (!setSelectedSeriesIds) {
      return
    }

    setSelectedSeriesIds((prevIds) => {
      if (areAllDisplaySeriesSelected) {
        return prevIds.filter((id) => {
          return !selectableDisplaySeriesIds.includes(id)
        })
      }

      return Array.from(
        new Set([
          ...prevIds,
          ...selectableDisplaySeriesIds
        ])
      )
    })
  }

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

              <option value="read">
                読了順
              </option>

              <option value="title">
                作品名順
              </option>

              <option value="start">
                開始号順
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
                type="button"
                onClick={
                  toggleDisplaySeriesSelection
                }
              >
                {areAllDisplaySeriesSelected
                  ? '全解除'
                  : '全選択'}
              </button>

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
                    {getReadIssueText(item)}
                  </span>
                </div>

                {shouldShowStartIssue && (
                  <div className="series-start-issue">
                    開始：
                    <span>
                      {getStartIssueText(item)}
                    </span>
                  </div>
                )}

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
                            ? `「${item.title}」を連載中に戻しますか？`
                            : `「${item.title}」を完結にしますか？`
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

      ) : viewMode === 'compact' ? (

        <div className="series-compact-list">

          {displaySeries.map((item) => {
            const unreadCount =
              getUnreadCount(item)

            return (
              <div
                className={`series-compact-card ${
                  item.status === 'completed'
                    ? 'completed'
                    : ''
                }`}
                key={item.id}
                onClick={() =>
                  navigate(
                    `/series/${item.id}`
                  )
                }
              >
                <div className="series-compact-main">

                  <div className="series-compact-title">
                    {item.title}
                  </div>

                  <div className="series-compact-meta">
                    <span>
                      読了 {getReadIssueText(item)}
                    </span>

                    <span>
                      {item.status === 'completed'
                        ? '完結'
                        : `未読 ${unreadCount}`}
                    </span>

                    {shouldShowStartIssue && (
                      <span>
                        開始 {getStartIssueText(item)}
                      </span>
                    )}
                  </div>

                </div>

                <div className="series-compact-buttons">
                  <button
                    className="minus-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      minusIssue(item.id)
                    }}
                  >
                    -1
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addIssue(item.id)
                    }}
                  >
                    +1
                  </button>
                </div>

                <div className="series-compact-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(
                        `/series/${item.id}`
                      )
                    }}
                  >
                    編集
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()

                      const ok =
                        window.confirm(
                          item.status === 'completed'
                            ? `「${item.title}」を連載中に戻しますか？`
                            : `「${item.title}」を完結にしますか？`
                        )

                      if (!ok) {
                        return
                      }

                      toggleStatus(item.id)
                    }}
                  >
                    {item.status === 'completed'
                      ? '連載中'
                      : '完結'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()

                      const ok =
                        window.confirm(
                          `「${item.title}」を削除しますか？`
                        )

                      if (!ok) {
                        return
                      }

                      deleteSeries(item.id)
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            )
          })}

        </div>

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
                {getReadIssueText(item)}
              </div>

              {shouldShowStartIssue && (
                <div className="card-start-issue">
                  開始 {getStartIssueText(item)}
                </div>
              )}

              <div className="card-unread">
                {item.status === 'completed'
                  ? '完結'
                  : `未読 ${getUnreadCount(item)}`}
              </div>

            </div>
          ))}

        </div>

      )}

      {isViewModeMenuOpen && (
        <div
          className="view-mode-menu-backdrop"
          onClick={() =>
            setIsViewModeMenuOpen(false)
          }
        />
      )}

      <div className="bottom-nav series-bottom-nav">

        <div
          className="view-mode-selector"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {isViewModeMenuOpen && (
            <div
              className="view-mode-menu"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {viewModeOptions.map((option) => {
                const isSelected =
                  viewMode === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`view-mode-menu-item ${
                      isSelected ? 'active' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setViewMode(option.value)
                      setIsViewModeMenuOpen(false)
                    }}
                  >
                    <span className="view-mode-check">
                      {isSelected ? '✓' : ''}
                    </span>

                    <span>
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <button
            type="button"
            className="view-mode-button"
            onClick={() =>
              setIsViewModeMenuOpen(
                (isOpen) => !isOpen
              )
            }
          >
            {viewModeLabelMap[viewMode] ||
              'リスト'}
            {' '}
            {isViewModeMenuOpen
              ? '▲'
              : '▼'}
          </button>
        </div>

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
