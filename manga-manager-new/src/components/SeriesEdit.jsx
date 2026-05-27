function SeriesEdit({
  selectedSeries,
  setSelectedSeries,
  editTitle,
  setEditTitle,
  saveEdit,
  updateIssueDirect,
  handleImageUpload
}) {
  return (
    <div className="app">

      <div className="edit-header">
        <button
          className="back-icon-button"
          onClick={() =>
            setSelectedSeries(null)
          }
        >
          ←
        </button>

        <div className="edit-title">
          作品編集
        </div>
      </div>

      <div className="edit-page">

        <div className="cover large">
          {selectedSeries.image ? (
            <img
              src={selectedSeries.image}
              alt=""
            />
          ) : (
            <div className="no-image">
              NO IMAGE
            </div>
          )}
        </div>

        <div className="image-upload-area">
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageUpload(
                e,
                selectedSeries.id
              )
            }
          />
        </div>

        <div className="edit-group">
          <div>連載名</div>

          <input
            value={editTitle}
            onChange={(e) =>
              setEditTitle(e.target.value)
            }
          />
        </div>

        <div className="edit-group">
          <div>号数</div>

          <input
            type="number"
            value={selectedSeries.issue}
            onChange={(e) =>
              updateIssueDirect(
                selectedSeries.id,
                Number(e.target.value)
              )
            }
          />
        </div>

        <button
          className="save-button"
          onClick={() => {
            saveEdit(selectedSeries.id)
            setSelectedSeries(null)
          }}
        >
          保存
        </button>

      </div>
    </div>
  )
}

export default SeriesEdit