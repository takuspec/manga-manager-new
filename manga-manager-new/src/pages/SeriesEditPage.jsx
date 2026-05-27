import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SeriesEdit from '../components/SeriesEdit'

function SeriesEditPage({
  seriesList,
  editTitle,
  setEditTitle,
  saveEdit,
  updateIssueDirect,
  handleImageUpload,
  navigate
}) {
  const params = useParams()

  const seriesId =
    Number(params.seriesId)

  const selectedSeries =
    seriesList.find((item) => {
      return item.id === seriesId
    })

  useEffect(() => {
    if (selectedSeries) {
      setEditTitle(
        selectedSeries.title
      )
    }
  }, [
    selectedSeries,
    setEditTitle
  ])

  if (!selectedSeries) {
    return (
      <div className="app">

        <button
          onClick={() =>
            navigate(-1)
          }
        >
          ← 戻る
        </button>

        <div className="title">
          作品が見つかりません
        </div>

      </div>
    )
  }

  return (
    <SeriesEdit
      selectedSeries={selectedSeries}
      setSelectedSeries={() =>
        navigate(-1)
      }
      editTitle={editTitle}
      setEditTitle={setEditTitle}
      saveEdit={saveEdit}
      updateIssueDirect={updateIssueDirect}
      handleImageUpload={handleImageUpload}
    />
  )
}

export default SeriesEditPage