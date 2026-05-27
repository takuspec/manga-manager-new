function CompletedPage({
  seriesList,
  getMagazineName,
  navigate
}) {
  const completedSeries =
    seriesList.filter((item) => {
      return item.status === 'completed'
    })

  return (
    <div className="app">

      <div className="title">
        完結作品
      </div>

      <div className="grid">

        {completedSeries.map((item) => (

          <div
            className="card completed"
            key={item.id}
            onClick={() =>
              navigate(
                `/series/${item.id}`
              )
            }
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
              {getMagazineName(
                item.magazineId
              )}
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

        <button>
          完結
        </button>

      </div>

    </div>
  )
}

export default CompletedPage