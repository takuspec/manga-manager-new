function SeriesActionPanel({
  item,
  navigate,
  toggleStatus,
  deleteSeries,
  className = '',
  onClose
}) {
  return (
    <div
      className={`series-popup-menu ${className}`}
      onClick={(e) =>
        e.stopPropagation()
      }
    >
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
          onClose?.()
        }}
      >
        {item.status === 'completed'
          ? '連載中に戻す'
          : '完結にする'}
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
          onClose?.()
        }}
      >
        削除
      </button>
    </div>
  )
}

export default SeriesActionPanel
