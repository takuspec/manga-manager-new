import { useState } from 'react'
import ImageCropModal from './ImageCropModal'
import ImageView from './ImageView'

function SeriesAdd({
  newSeriesTitle,
  setNewSeriesTitle,
  newSeriesStartIssueYear,
  setNewSeriesStartIssueYear,
  newSeriesStartIssue,
  setNewSeriesStartIssue,
  newSeriesIssueYear,
  setNewSeriesIssueYear,
  newSeriesIssue,
  setNewSeriesIssue,
  newSeriesImage,
  setNewSeriesImage,
  saveNewSeries,
  newSeriesHartaGroup,
  setNewSeriesHartaGroup,
  magazine,
  goBack
}) {
  const yearOptions =
    Array.from(
      { length: 11 },
      (_, i) =>
        new Date().getFullYear() - 5 + i
    )

  const isHarta =
    magazine?.frequency === 'harta'

  const [
    showCropModal,
    setShowCropModal
  ] = useState(false)

  const [
    cropTargetImage,
    setCropTargetImage
  ] = useState(null)

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0]

    if (!file) {
      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      setCropTargetImage(
        reader.result
      )

      setShowCropModal(true)
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
          <ImageView
            imageBlob={
              newSeriesImage instanceof Blob
                ? newSeriesImage
                : null
            }
            fallbackImage={
              typeof newSeriesImage === 'string'
                ? newSeriesImage
                : ''
            }
          />
        </div>

        <div className="image-upload-area">
          <input
            type="file"
            accept="image/*"
            onClick={(e) => {
              e.target.value = ''
            }}
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
          <div>連載開始</div>

          {!isHarta && (
          <select
            value={newSeriesStartIssueYear}
            onChange={(e) =>
              setNewSeriesStartIssueYear(
                Number(e.target.value)
              )
            }
          >
            {yearOptions.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}年
              </option>
            ))}
          </select>
          )}

          <input
            type="number"
            value={newSeriesStartIssue}
            onChange={(e) =>
              setNewSeriesStartIssue(
                Number(e.target.value)
              )
            }
          />
        </div>

        {!isHarta && (
          <div className="edit-group">
            <div>読了 / 完結号</div>

            <select
              value={newSeriesIssueYear}
              onChange={(e) =>
                setNewSeriesIssueYear(
                  Number(e.target.value)
                )
              }
            >
              {yearOptions.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}年
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="edit-group">
          <div>号数</div>

        {isHarta && (
          <div className="edit-group">
            <div>掲載区分</div>

            <select
              value={newSeriesHartaGroup}
              onChange={(e) =>
                setNewSeriesHartaGroup(
                  e.target.value
                )
              }
            >
              <option value="ha">
                は組（毎号掲載）
              </option>

              <option value="ru">
                る組（偶数号）
              </option>

              <option value="ta">
                た組（奇数号）
              </option>
            </select>
          </div>
        )}

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
          保存
        </button>

      </div>

      {showCropModal && (
        <ImageCropModal
          image={cropTargetImage}
          onSave={(croppedImage) => {
            setNewSeriesImage(
              croppedImage
            )

            setShowCropModal(false)
            setCropTargetImage(null)
          }}
          onCancel={() => {
            setShowCropModal(false)
            setCropTargetImage(null)
          }}
        />
      )}

    </div>
  )
}

export default SeriesAdd
