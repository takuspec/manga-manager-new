import { useEffect, useState } from 'react'

function MagazineEditPage({
  magazineList,
  getEstimatedLatestIssue,
  saveMagazineEdit,
  deleteMagazine,
  handleMagazineImageUpload,
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
    editCurrentIssue,
    setEditCurrentIssue
  ] = useState(1)

  useEffect(() => {
    if (magazine) {
      setEditMagazineName(
        magazine.name
      )

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

          {magazine.image ? (

            <img
              src={magazine.image}
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
              handleMagazineImageUpload(
                e,
                magazine.id
              )
            }
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

          <input
            type="number"
            value={editCurrentIssue}
            onChange={(e) =>
              setEditCurrentIssue(
                Number(
                  e.target.value
                )
              )
            }
          />

        </div>

        <button
          className="save-button"
          onClick={() => {
            saveMagazineEdit(
              magazine.id,
              editMagazineName,
              editFrequency,
              editReleaseDay,
              editReleaseDate,
              editCurrentIssue
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

    </div>
  )
}

export default MagazineEditPage