import DataActionMenu from '../components/DataActionMenu'

function CompletedPage({
  magazineList,
  seriesList,
  getMagazineCover,
  onBackupData,
  onImportData,
  navigate
}) {
  const completedMagazines =
    magazineList
      .map((magazine) => {
        const completedCount =
          seriesList.filter((item) => {
            return (
              item.magazineId === magazine.id &&
              item.status === 'completed'
            )
          }).length

        return {
          ...magazine,
          completedCount: completedCount
        }
      })
      .filter((magazine) => {
        return magazine.completedCount > 0
      })

  return (
    <div className="app">

      <div className="page-title-row">
      <div className="title">
        完結一覧
      </div>

      <DataActionMenu
        onBackupData={onBackupData}
        onImportData={onImportData}
      />
      </div>

      <div className="completed-magazine-list">

        {completedMagazines.map((magazine) => {
          const coverImage =
            getMagazineCover(magazine)

          return (
            <div
              key={magazine.id}
              className="completed-magazine-card"
              onClick={() =>
                navigate(
                  `/completed/${magazine.id}`
                )
              }
            >

              <div className="magazine-cover">

                {coverImage ? (

                  <img
                    src={coverImage}
                    alt=""
                  />

                ) : (

                  <div className="no-image">
                    NO IMAGE
                  </div>

                )}

              </div>

              <div className="magazine-info">

                <div className="magazine-title">
                  {magazine.name}
                </div>

                <div className="magazine-stat">
                  完結作品
                  <span>
                    {magazine.completedCount}作品
                  </span>
                </div>

              </div>

              <div className="completed-magazine-arrow">
                ›
              </div>

            </div>
          )
        })}

      </div>

      <div className="bottom-nav">

        <button
          onClick={() =>
            navigate('/')
          }
        >
          雑誌
        </button>

        <button>
          完結
        </button>

      </div>

    </div>
  )
}

export default CompletedPage
