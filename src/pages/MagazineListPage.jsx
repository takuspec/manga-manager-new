import {
  formatIssue,
  getEstimatedLatestIssueInfo
} from '../utils/issueUtils'
import DataActionMenu from '../components/DataActionMenu'
import ImageView from '../components/ImageView'

function MagazineListPage({
  magazineList,
  seriesList,
  newMagazineName,
  setNewMagazineName,
  addMagazine,
  getUnreadCount,
  getMagazineCover,
  onBackupData,
  onImportData,
  navigate
}) {
  return (
    <div className="app">

      <div className="page-title-row">
      <div className="title">
        雑誌一覧
      </div>

      <DataActionMenu
        onBackupData={onBackupData}
        onImportData={onImportData}
      />
      </div>

      <div className="magazine-add-row">

        <input
          type="text"
          placeholder="新規雑誌を入力"
          value={newMagazineName}
          onChange={(e) =>
            setNewMagazineName(
              e.target.value
            )
          }
        />

        <button onClick={addMagazine}>
          雑誌追加
        </button>

      </div>

      <div className="magazine-list">

        {magazineList.map((magazine) => {
          const magazineSeries =
            seriesList.filter((item) => {
              return (
                item.magazineId ===
                  magazine.id &&
                item.status === 'ongoing'
              )
            })

          const seriesCount =
            magazineSeries.length

          const unreadTotal =
            magazineSeries.reduce(
              (total, item) => {
                return (
                  total +
                  getUnreadCount(item)
                )
              },
              0
            )

          const coverImage =
            getMagazineCover(magazine)

          const latestIssue =
            getEstimatedLatestIssueInfo(
              magazine
            )

          return (
            <div
              key={magazine.id}
              className="magazine-list-card"
              onClick={() =>
                navigate(
                  `/magazine/${magazine.id}`
                )
              }
            >

              <div className="magazine-cover">

                <ImageView
                  imageId={coverImage.imageId}
                  fallbackImage={coverImage.image}
                />

              </div>

              <div className="magazine-info">

                <div className="magazine-title">
                  {magazine.name}
                </div>

                <div className="magazine-stat">
                  最新号
                  <span>
                    {formatIssue(
                      latestIssue.year,
                      latestIssue.issue,
                      magazine
                    )}
                  </span>
                </div>

                <div className="magazine-stat">
                  連載
                  <span>
                    {seriesCount}作品
                  </span>
                </div>

                <div className="magazine-stat">
                  未読
                  <span>
                    {unreadTotal}
                  </span>
                </div>

              </div>

              <button
                className="magazine-menu-button"
                onClick={(e) => {
                  e.stopPropagation()

                  navigate(
                    `/magazine/${magazine.id}/edit`
                  )
                }}
              >
                ⋮
              </button>

            </div>
          )
        })}

      </div>

      <div className="bottom-nav">

        <button>
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

export default MagazineListPage
