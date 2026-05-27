function SeriesAdd({
  newSeriesTitle,
  setNewSeriesTitle,
  newSeriesIssue,
  setNewSeriesIssue,
  newSeriesImage,
  setNewSeriesImage,
  saveNewSeries,
  goBack
}) {
  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setNewSeriesImage(reader.result)
    }

    reader.readAsDataURL(file)
  }

  return (
    <div className="app">

      <div className="edit-header">
        <button
          className="back-icon-button"
          onClick={goBack}
        >
          ←
        </button>

        <div className="edit-title">
          作品追加
        </div>
      </div>

      <div className="edit-page">

        <div className="cover large">
          {newSeriesImage ? (
            <img
              src={newSeriesImage}
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
            onChange={handleImageChange}
          />
        </div>

        <div className="edit-group">
          <div>連載名</div>

          <input
            value={newSeriesTitle}
            onChange={(e) =>
              setNewSeriesTitle(e.target.value)
            }
          />
        </div>

        <div className="edit-group">
          <div>号数</div>

          <input
            type="number"
            value={newSeriesIssue}
            onChange={(e) =>
              setNewSeriesIssue(e.target.value)
            }
          />
        </div>

        <button
          className="save-button"
          onClick={saveNewSeries}
        >
          追加
        </button>

      </div>
    </div>
  )
}

export default SeriesAdd