import { useState } from 'react'
import ImageCropModal from './ImageCropModal'
import { useEffect } from 'react'
import ImageView from './ImageView'
import IssueInputRow from './IssueInputRow'
import {
  clampIssueForYear,
  getEstimatedLatestIssueInfo,
  getIssueOptions,
  getYearOptions
} from '../utils/issueUtils'

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
    getYearOptions()

  const isHarta =
    magazine?.frequency === 'harta'

  const startIssueOptions =
    getIssueOptions(
      magazine,
      newSeriesStartIssueYear
    )

  const readIssueOptions =
    getIssueOptions(
      magazine,
      newSeriesIssueYear,
      {
        includeUnread: true
      }
    )

  const [
    showCropModal,
    setShowCropModal
  ] = useState(false)

  const [
    cropTargetImage,
    setCropTargetImage
  ] = useState(null)

  useEffect(() => {
    if (!magazine) {
      return
    }

    const latest =
      getEstimatedLatestIssueInfo(magazine)

    setNewSeriesStartIssueYear(
      latest.year
    )
    setNewSeriesStartIssue(
      latest.issue
    )
    setNewSeriesIssueYear(
      latest.year
    )
    setNewSeriesIssue(
      latest.issue
    )
  }, [magazine?.id])

  const handleStartIssueYearChange = (year) => {
    setNewSeriesStartIssueYear(year)

    setNewSeriesStartIssue(
      clampIssueForYear(
        magazine,
        year,
        newSeriesStartIssue
      )
    )
  }

  const handleIssueYearChange = (year) => {
    setNewSeriesIssueYear(year)

    setNewSeriesIssue(
      clampIssueForYear(
        magazine,
        year,
        newSeriesIssue,
        {
          includeUnread: true
        }
      )
    )
  }

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

          <IssueInputRow
            yearValue={newSeriesStartIssueYear}
            onYearChange={setNewSeriesStartIssueYear}
            issueValue={newSeriesStartIssue}
            onIssueChange={setNewSeriesStartIssue}
            yearOptions={yearOptions}
            issueOptions={startIssueOptions}
            showYear={!isHarta}
            useIssueSelect={!isHarta}
            prefix={isHarta ? 'volume' : ''}
            onYearSelected={
              handleStartIssueYearChange
            }
          />
        </div>

        <div className="edit-group">
          <div>読了 / 完結号</div>

          <IssueInputRow
            yearValue={newSeriesIssueYear}
            onYearChange={setNewSeriesIssueYear}
            issueValue={newSeriesIssue}
            onIssueChange={setNewSeriesIssue}
            yearOptions={yearOptions}
            issueOptions={readIssueOptions}
            showYear={!isHarta}
            useIssueSelect={!isHarta}
            prefix={isHarta ? 'volume' : ''}
            onYearSelected={
              handleIssueYearChange
            }
          />
        </div>

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
