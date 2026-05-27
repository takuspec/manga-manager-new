function MagazineSeriesPage({
  magazineList,
  seriesList,
  viewMode,
  setViewMode,
  sortMode,
  setSortMode,
  showCompleted,
  setShowCompleted,
  menuSeriesId,
  setMenuSeriesId,
  selectedSeriesIds,
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
    getEstimatedLatestIssue(
      selectedMagazine
    )

  const filteredSeries =
    seriesList
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
        switch (sortMode) {
          case 'unread':
            return (
              getUnreadCount(b) -
              getUnreadCount(a)
            )

          case 'title':
            return a.title.localeCompare(
              b.title,
              'ja'
            )

          case 'issue':
            return b.issue - a.issue

          default:
            return 0
        }
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

      <div className="latest-issue-box">
        <span>推測最新号</span>
        <strong>
          {estimatedLatestIssue}号
        </strong>
      </div>

      <div className="sort-row">

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

      </div>

      {viewMode === 'grid' && (

        <div className="bulk-issue-box">

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

      {viewMode === 'list' ? (

        filteredSeries.map((item) => {
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

                {item.image ? (

                  <img
                    src={item.image}
                    alt=""
                  />

                ) : (

                  <div className="no-image">
                    NO IMAGE
                  </div>

                )}

              </div>

              <div className="series-info">

                <div className="series-title">
                  {item.title}
                </div>

                <div className="series-issue">
                  読了：
                  <span>
                    {item.issue === 0
                      ? '未読'
                      : `${item.issue}号`}
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

          {filteredSeries.map((item) => (

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

                {item.image ? (

                  <img
                    src={item.image}
                    alt=""
                  />

                ) : (

                  <div className="no-image">
                    NO IMAGE
                  </div>

                )}

              </div>

              <div className="card-title">
                {item.title}
              </div>

              <div className="card-issue">
                {item.status === 'completed'
                  ? `完結 ${item.issue}号`
                  : item.issue === 0
                    ? '未読'
                    : `読了 ${item.issue}号`}
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
            ? '完結を隠す'
            : '完結を表示'}
        </button>

      </div>

    </div>
  )
}

export default MagazineSeriesPage