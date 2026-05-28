function WeeklySettingsPage({
  magazineList,
  navigate
}) {
  const weeklyMagazines =
    magazineList.filter((magazine) => {
      return magazine.frequency === 'weekly'
    })

  return (
    <div className="app">
      <div className="series-page-header">
        <button
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← 戻る
        </button>

        <div className="title series-page-title">
          週刊誌情報
        </div>

        <div />
      </div>

      <div className="weekly-settings-list">
        {weeklyMagazines.length === 0 && (
          <div className="empty-message">
            週刊誌がありません
          </div>
        )}

        {weeklyMagazines.map((magazine) => (
          <button
            key={magazine.id}
            type="button"
            className="weekly-settings-card"
            onClick={() =>
              navigate(
                `/weekly-settings/${magazine.id}`
              )
            }
          >
            <span>{magazine.name}</span>
            <strong>›</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

export default WeeklySettingsPage
