import { useEffect, useState } from 'react'
import ImageCropModal from '../components/ImageCropModal'
import ImageView from '../components/ImageView'

function MagazineEditPage({
  magazineList,
  getEstimatedLatestIssue,
  saveMagazineEdit,
  deleteMagazine,
  handleMagazineImageUpload,
  saveCroppedMagazineImage,
  navigate,
  useParams
}) {
  const params = useParams()

  const magazineId =
    Number(params.magazineId)

  const magazine =
    magazineList.find((item) => {
      return item.id === magazineId
    })

  const [
    editMagazineName,
    setEditMagazineName
  ] = useState('')

  const [
    editFrequency,
    setEditFrequency
  ] = useState('weekly')

  const [
    editReleaseDay,
    setEditReleaseDay
  ] = useState(1)

  const [
    editReleaseDate,
    setEditReleaseDate
  ] = useState(1)

  const [
    editCurrentIssueYear,
    setEditCurrentIssueYear
  ] = useState(new Date().getFullYear())

  const [
    editCurrentIssue,
    setEditCurrentIssue
  ] = useState(1)

  const [
    showCropModal,
    setShowCropModal
  ] = useState(false)

  const [
    cropTargetImage,
    setCropTargetImage
  ] = useState(null)

  const [
    editMagazineImage,
    setEditMagazineImage
  ] = useState('')

  const [
    editMagazineImageBlob,
    setEditMagazineImageBlob
  ] = useState(null)

  const yearOptions =
    Array.from(
      { length: 11 },
      (_, i) =>
        new Date().getFullYear() - 5 + i
    )

  useEffect(() => {
    if (magazine) {
      setEditMagazineName(
        magazine.name
      )

      setEditMagazineImage(
        magazine.image || ''
      )

      setEditMagazineImageBlob(null)

      setEditFrequency(
        magazine.frequency ||
          'weekly'
      )

      setEditReleaseDay(
        magazine.releaseDay ||
          1
      )

      setEditReleaseDate(
        magazine.releaseDate ||
          1
      )

      setEditCurrentIssueYear(
        magazine.baseIssueYear ||
          new Date().getFullYear()
      )

      setEditCurrentIssue(
        getEstimatedLatestIssue(
          magazine
        )
      )
    }
  }, [
    magazine,
    getEstimatedLatestIssue
  ])

  if (!magazine) {
    return (
      <div className="app">

        <button
          onClick={() =>
            navigate('/')
          }
        >
          ← 雑誌一覧へ
        </button>

        <div className="title">
          雑誌が見つかりません
        </div>

      </div>
    )
  }

  return (
    <div className="app">

      <div className="edit-header">

        <button
          className="back-icon-button"
          onClick={() =>
            navigate(-1)
          }
        >
          ←
        </button>

        <div className="edit-title">
          雑誌編集
        </div>

      </div>

      <div className="edit-page">

        <div className="cover large">

          <ImageView
            imageId={magazine.imageId}
            imageBlob={editMagazineImageBlob}
            fallbackImage={editMagazineImage}
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

          <div>雑誌名</div>

          <input
            value={editMagazineName}
            onChange={(e) =>
              setEditMagazineName(
                e.target.value
              )
            }
          />

        </div>

        <div className="edit-group">

          <div>刊行種別</div>

          <select
            value={editFrequency}
            onChange={(e) =>
              setEditFrequency(
                e.target.value
              )
            }
          >
            <option value="weekly">
              週刊
            </option>

            <option value="monthly">
              月刊
            </option>

            <option value="harta">
              HARTA（年10回刊）
            </option>

          </select>

        </div>

        {editFrequency === 'weekly' ? (

          <div className="edit-group">

            <div>発売曜日</div>

            <select
              value={editReleaseDay}
              onChange={(e) =>
                setEditReleaseDay(
                  Number(
                    e.target.value
                  )
                )
              }
            >
              <option value={0}>
                日曜
              </option>

              <option value={1}>
                月曜
              </option>

              <option value={2}>
                火曜
              </option>

              <option value={3}>
                水曜
              </option>

              <option value={4}>
                木曜
              </option>

              <option value={5}>
                金曜
              </option>

              <option value={6}>
                土曜
              </option>
            </select>

          </div>

        ) : (

          <div className="edit-group">

            <div>発売日</div>

            <input
              type="number"
              min="1"
              max="31"
              value={editReleaseDate}
              onChange={(e) =>
                setEditReleaseDate(
                  Number(
                    e.target.value
                  )
                )
              }
            />

          </div>

        )}

        <div className="edit-group">

          <div>現在の最新号</div>

          <div className="issue-input-row">

            <select
              value={editCurrentIssueYear}
              onChange={(e) =>
                setEditCurrentIssueYear(
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

            <input
              type="number"
              value={editCurrentIssue}
              onChange={(e) =>
                setEditCurrentIssue(
                  Number(e.target.value)
                )
              }
            />

          </div>

        </div>

        <button
          className="save-button"
          onClick={async () => {
            await saveMagazineEdit(
              magazine.id,
              editMagazineName,
              editFrequency,
              editReleaseDay,
              editReleaseDate,
              editCurrentIssueYear,
              editCurrentIssue,
              editMagazineImageBlob,
              magazine.imageId
            )
            navigate(-1)
          }}
        >
          保存
        </button>

        <button
          className="delete-button"
          onClick={() =>
            deleteMagazine(
              magazine.id
            )
          }
        >
          雑誌削除
        </button>

      </div>

      {showCropModal && (
        <ImageCropModal
          image={cropTargetImage}
          onSave={(croppedImage) => {
            setEditMagazineImageBlob(croppedImage)

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

export default MagazineEditPage
