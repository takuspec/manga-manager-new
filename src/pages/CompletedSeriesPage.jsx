import { useState } from 'react'
import { useParams } from 'react-router-dom'
import ImageView from '../components/ImageView'
import {
  formatIssueNumber
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

function CompletedSeriesPage({
  magazineList,
  seriesList,
  navigate
}) {
  const params = useParams()

  const selectedMagazineId =
    params.magazineId

  const isAllMagazines =
    selectedMagazineId === 'all'

  const magazineId =
    Number(selectedMagazineId)

  const magazine =
    isAllMagazines
      ? null
      : magazineList.find((item) => {
          return item.id === magazineId
        })

  const [sortMode, setSortMode] =
    useState('title')

  const [sortDirection, setSortDirection] =
    useState('asc')

  const [viewMode, setViewMode] =
    useState('grid')

  const [
    isViewModeMenuOpen,
    setIsViewModeMenuOpen
  ] = useState(false)

  const [
    isMagazineMenuOpen,
    setIsMagazineMenuOpen
  ] = useState(false)

  const getSeriesMagazine = (item) => {
    return magazineList.find((magazineItem) => {
      return magazineItem.id === item.magazineId
    })
  }

  const getIssueText = (
    item,
    targetMagazine,
    type
  ) => {
    const isHarta =
      targetMagazine?.frequency === 'harta'

    const issue =
      type === 'start'
        ? item.startIssue
        : item.issue

    const issueYear =
      type === 'start'
        ? item.startIssueYear
        : item.issueYear

    if (isHarta) {
      return `volume${issue || '-'}`
    }

    return `${issueYear || '----'}年 ${formatIssueNumber(
      issue,
      targetMagazine
    )}`
  }

  const magazineOptions = [
    {
      value: 'all',
      label: '全雑誌'
    },
    ...magazineList.map((magazineItem) => {
      return {
        value: String(magazineItem.id),
        label: magazineItem.name
      }
    })
  ]

  const selectedMagazineLabel =
    isAllMagazines
      ? '全雑誌'
      : magazine?.name || '雑誌'

  if (!isAllMagazines && !magazine) {
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
        if (item.status !== 'completed') {
          return false
        }

        if (isAllMagazines) {
          return true
        }

        return item.magazineId === magazineId
      })
      .sort((a, b) => {
        let result = 0

        if (sortMode === 'title') {
          result =
            (a.title || '').localeCompare(
              b.title || '',
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

  const closeMenus = () => {
    setIsViewModeMenuOpen(false)
    setIsMagazineMenuOpen(false)
  }

  const renderMagazineName = (item) => {
    if (!isAllMagazines) {
      return null
    }

    const itemMagazine =
      getSeriesMagazine(item)

    return (
      <div className="completed-series-magazine">
        {itemMagazine?.name || '不明な雑誌'}
      </div>
    )
  }

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
          {selectedMagazineLabel}
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
            開始号順
          </option>

          <option value="end">
            終了号順
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

      {viewMode === 'list' ? (
        <div className="completed-series-list">
          {completedSeries.map((item) => {
            const itemMagazine =
              getSeriesMagazine(item)

            return (
              <div
                className="completed-series-list-card"
                key={item.id}
              >
                <div className="series-cover-small">
                  <ImageView
                    imageId={item.imageId}
                    fallbackImage={item.image}
                  />
                </div>

                <div className="completed-series-info">
                  <div className="series-title">
                    {item.title}
                  </div>

                  {renderMagazineName(item)}

                  <div className="completed-series-meta">
                    <span>
                      開始 {getIssueText(
                        item,
                        itemMagazine,
                        'start'
                      )}
                    </span>

                    <span>
                      終了 {getIssueText(
                        item,
                        itemMagazine,
                        'end'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : viewMode === 'compact' ? (
        <div className="series-compact-list">
          {completedSeries.map((item) => {
            const itemMagazine =
              getSeriesMagazine(item)

            return (
              <div
                className="series-compact-card"
                key={item.id}
              >
                <div className="series-compact-main">
                  <div className="series-compact-title">
                    {item.title}
                  </div>

                  {renderMagazineName(item)}

                  <div className="series-compact-meta">
                    <span>
                      開始 {getIssueText(
                        item,
                        itemMagazine,
                        'start'
                      )}
                    </span>

                    <span>
                      終了 {getIssueText(
                        item,
                        itemMagazine,
                        'end'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid">

          {completedSeries.map((item) => {
            const itemMagazine =
              getSeriesMagazine(item)

            return (
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

                {renderMagazineName(item)}

                <div className="card-issue">
                  終了 {getIssueText(
                    item,
                    itemMagazine,
                    'end'
                  )}
                </div>
              </div>
            )
          })}

        </div>
      )}

      {(isViewModeMenuOpen || isMagazineMenuOpen) && (
        <div
          className="view-mode-menu-backdrop"
          onClick={closeMenus}
        />
      )}

      <div className="bottom-nav completed-series-footer">

        <div
          className="view-mode-selector completed-view-selector"
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
            onClick={() => {
              setIsMagazineMenuOpen(false)
              setIsViewModeMenuOpen(
                (isOpen) => !isOpen
              )
            }}
          >
            {viewModeLabelMap[viewMode] ||
              'グリッド'}
            {' '}
            {isViewModeMenuOpen
              ? '▲'
              : '▼'}
          </button>
        </div>

        <div
          className="view-mode-selector completed-magazine-selector"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          {isMagazineMenuOpen && (
            <div
              className="view-mode-menu completed-magazine-menu"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {magazineOptions.map((option) => {
                const isSelected =
                  selectedMagazineId === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`view-mode-menu-item ${
                      isSelected ? 'active' : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsMagazineMenuOpen(false)
                      navigate(
                        `/completed/${option.value}`,
                        { replace: true }
                      )
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
            onClick={() => {
              setIsViewModeMenuOpen(false)
              setIsMagazineMenuOpen(
                (isOpen) => !isOpen
              )
            }}
          >
            <span className="completed-footer-label">
              {selectedMagazineLabel}
            </span>
            {' '}
            {isMagazineMenuOpen
              ? '▲'
              : '▼'}
          </button>
        </div>

      </div>

    </div>
  )
}

export default CompletedSeriesPage
