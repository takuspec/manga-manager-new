import { useEffect, useState } from 'react'
import ImageView from '../components/ImageView'
import SeriesActionPanel from '../components/SeriesActionPanel'
import IssueInputRow from '../components/IssueInputRow'
import IssueLabel from '../components/IssueLabel'

import {
  clampIssueForYear,
  getIssueOptions,
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

  const renderReadIssueLabel = (item) => {
    return (
      <IssueLabel
        magazine={selectedMagazine}
        year={
          item.issueYear ||
          new Date().getFullYear()
        }
        issue={item.issue}
      />
    )
  }

  const renderStartIssueLabel = (item) => {
    const startIssue =
      Number(item.startIssue) || 0

    if (!startIssue) {
      return '-'
    }

    return (
      <IssueLabel
        magazine={selectedMagazine}
        year={
          item.startIssueYear ||
          new Date().getFullYear()
        }
        issue={startIssue}
      />
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

  const isHarta =
    selectedMagazine.frequency === 'harta'

  const bulkIssueOptions =
    getIssueOptions(
      selectedMagazine,
      bulkIssueYear,
      {
        includeUnread: true
      }
    )

  const handleBulkIssueYearChange = (year) => {
    setBulkIssueYear(year)

    setBulkIssueValue(
      clampIssueForYear(
        selectedMagazine,
        year,
        bulkIssueValue,
        {
          includeUnread: true
        }
      )
    )
  }

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
    <div className="app series-page">

      <div className="series-fixed-header">

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
            <IssueLabel
              magazine={selectedMagazine}
              year={estimatedLatestIssue.year}
              issue={estimatedLatestIssue.issue}
            />
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

              <IssueInputRow
                yearValue={bulkIssueYear}
                onYearChange={setBulkIssueYear}
                issueValue={bulkIssueValue}
                onIssueChange={setBulkIssueValue}
                yearOptions={yearOptions}
                issueOptions={bulkIssueOptions}
                useIssueSelect={!isHarta}
                emptyIssueValue=""
                className="bulk-issue-input-row"
                onYearSelected={
                  handleBulkIssueYearChange
                }
              />

              <button
                onClick={bulkChangeSelectedIssue}
              >
                一括変更
              </button>

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

      </div>

      <div className="series-scroll-area">

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

                <div className="series-issue issue-display-row">
                  <span className="issue-display-label">
                    読了：
                  </span>

                  {renderReadIssueLabel(item)}
                </div>

                {shouldShowStartIssue && (
                  <div className="series-start-issue issue-display-row">
                    <span className="issue-display-label">
                      開始：
                    </span>

                    {renderStartIssueLabel(item)}
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
                <SeriesActionPanel
                  item={item}
                  navigate={navigate}
                  toggleStatus={toggleStatus}
                  deleteSeries={deleteSeries}
                  onClose={() =>
                    setMenuSeriesId(null)
                  }
                />
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
                onClick={(e) => {
                  e.stopPropagation()

                  setMenuSeriesId(
                    menuSeriesId === item.id
                      ? null
                      : item.id
                  )
                }}
              >
                <div className="series-compact-main">

                  <div className="series-compact-title">
                    {item.title}
                  </div>

                  <div className="series-compact-meta">
                    <span>
                      読了 {renderReadIssueLabel(item)}
                    </span>

                    <span>
                      {item.status === 'completed'
                        ? '完結'
                        : `未読 ${unreadCount}`}
                    </span>

                    {shouldShowStartIssue && (
                      <span>
                        開始 {renderStartIssueLabel(item)}
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

                {menuSeriesId === item.id && (
                  <SeriesActionPanel
                    item={item}
                    navigate={navigate}
                    toggleStatus={toggleStatus}
                    deleteSeries={deleteSeries}
                    onClose={() =>
                      setMenuSeriesId(null)
                    }
                  />
                )}
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
                {renderReadIssueLabel(item)}
              </div>

              {shouldShowStartIssue && (
                <div className="card-start-issue">
                  開始 {renderStartIssueLabel(item)}
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

      </div>

      <div className="bottom-nav series-bottom-nav series-fixed-footer">

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
