import ImageCropModal from './ImageCropModal'
import ImageView from './ImageView'
import { useEffect, useState } from 'react'
import {
  getHartaYearMonthFromVolume
} from '../utils/issueUtils'

function SeriesEdit({
  magazineList,
  selectedSeries,
  setSelectedSeries,
  editTitle,
  setEditTitle,
  saveEdit,
  updateIssueDirect,
  updateIssueYearDirect,
  updateStartIssueDirect,
  updateHartaGroupDirect,
  handleImageUpload,
  saveCroppedImage
}) {
  const yearOptions =
    Array.from(
      { length: 11 },
      (_, i) =>
        new Date().getFullYear() - 5 + i
    )

  const magazine =
    magazineList.find((item) => {
      return item.id === selectedSeries.magazineId
    })

  const isHarta =
    magazine?.frequency === 'harta'

  const [localTitle, setLocalTitle] =
    useState(editTitle)

  const [localStartIssueYear, setLocalStartIssueYear] =
    useState(
      selectedSeries.startIssueYear ||
        new Date().getFullYear()
    )

  const [localStartIssue, setLocalStartIssue] =
    useState(
      selectedSeries.startIssue || 1
    )

  const [localIssueYear, setLocalIssueYear] =
    useState(
      selectedSeries.issueYear ||
        new Date().getFullYear()
    )

  const [localIssue, setLocalIssue] =
    useState(selectedSeries.issue)

  const [localImage, setLocalImage] =
    useState(selectedSeries.image || '')

  const [
    localImageBlob,
    setLocalImageBlob
  ] = useState(null)

  const [
    localHartaGroup,
    setLocalHartaGroup
  ] = useState(
    selectedSeries.hartaGroup || 'ha'
  )

  const [showCropModal, setShowCropModal] =
    useState(false)

  const [cropTargetImage, setCropTargetImage] =
    useState(null)

  useEffect(() => {
    setLocalTitle(editTitle)

    setLocalImage(
      selectedSeries.image || ''
    )

    setLocalImageBlob(null)

    setLocalStartIssueYear(
      selectedSeries.startIssueYear ||
        new Date().getFullYear()
    )

    setLocalStartIssue(
      selectedSeries.startIssue || 1
    )

    setLocalIssueYear(
      selectedSeries.issueYear ||
        new Date().getFullYear()
    )

    setLocalIssue(selectedSeries.issue)

    setLocalHartaGroup(
      selectedSeries.hartaGroup || 'ha'
    )
  }, [editTitle, selectedSeries])

  const handleSave = async () => {
    const startIssue =
      Number(localStartIssue)

    const issue =
      Number(localIssue)

    const startIssueYear =
      isHarta && startIssue > 0
        ? getHartaYearMonthFromVolume(
            startIssue
          ).year
        : Number(localStartIssueYear)

    const issueYear =
      isHarta && issue > 0
        ? getHartaYearMonthFromVolume(
            issue
          ).year
        : Number(localIssueYear)

    setEditTitle(localTitle)

    saveEdit(
      selectedSeries.id,
      localTitle
    )

    updateStartIssueDirect(
      selectedSeries.id,
      startIssueYear,
      startIssue
    )

    updateIssueYearDirect(
      selectedSeries.id,
      issueYear
    )

    updateIssueDirect(
      selectedSeries.id,
      issue
    )

    await saveCroppedImage(
      selectedSeries.id,
      localImageBlob,
      selectedSeries.imageId
    )

    updateHartaGroupDirect(
      selectedSeries.id,
      localHartaGroup
    )

    setSelectedSeries(null)
  }

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
          <ImageView
            imageId={selectedSeries.imageId}
            imageBlob={localImageBlob}
            fallbackImage={localImage}
          />
        </div>

        <div className="image-upload-area">
          <input
            type="file"
            accept="image/*"
            onClick={(e) => {
              e.target.value = ''
            }}
            onChange={(e) => {
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
            }}
          />
        </div>

        <div className="edit-group">
          <div>連載名</div>

          <input
            value={localTitle}
            onChange={(e) =>
              setLocalTitle(e.target.value)
            }
          />
        </div>

        <div className="edit-group">
          <div>連載開始</div>

          {!isHarta && (
          <select
            value={localStartIssueYear}
            onChange={(e) =>
              setLocalStartIssueYear(
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
            value={localStartIssue}
            onChange={(e) =>
              setLocalStartIssue(
                e.target.value
              )
            }
          />
        </div>

        <div className="edit-group">
          <div>読了 / 完結号</div>

          {!isHarta && (
          <select
            value={localIssueYear}
            onChange={(e) =>
              setLocalIssueYear(
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
            value={localIssue}
            onChange={(e) =>
              setLocalIssue(e.target.value)
            }
          />
        </div>

        {isHarta && (
          <div className="edit-group">
            <div>掲載区分</div>

            <select
              value={localHartaGroup}
              onChange={(e) =>
                setLocalHartaGroup(
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

        {showCropModal && (
          <ImageCropModal
            image={cropTargetImage}
            onSave={(croppedImage) => {
              setLocalImageBlob(croppedImage)

              setShowCropModal(false)
              setCropTargetImage(null)
            }}
            onCancel={() => {
              setShowCropModal(false)
              setCropTargetImage(null)
            }}
          />
        )}

        <button
          className="save-button"
          onClick={handleSave}
        >
          保存
        </button>

      </div>
    </div>
  )
}

export default SeriesEdit
