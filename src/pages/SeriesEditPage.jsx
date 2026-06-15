import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SeriesEdit from '../components/SeriesEdit'

function SeriesEditPage({
  magazineList,
  seriesList,
  editTitle,
  setEditTitle,
  saveEdit,
  updateIssueDirect,
  updateIssueYearDirect,
  updateCompletedIssueDirect,
  updateStartIssueDirect,
  updateHartaGroupDirect,
  updatePublicationPaceDirect,
  handleImageUpload,
  saveCroppedImage,
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
    window.scrollTo(0, 0)
  }, [seriesId])

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
      magazineList={magazineList}
      selectedSeries={selectedSeries}
      setSelectedSeries={() =>
        navigate(-1)
      }
      editTitle={editTitle}
      setEditTitle={setEditTitle}
      saveEdit={saveEdit}
      updateIssueDirect={
        updateIssueDirect
      }
      updateIssueYearDirect={
        updateIssueYearDirect
      }
      updateCompletedIssueDirect={
        updateCompletedIssueDirect
      }
      updateStartIssueDirect={
        updateStartIssueDirect
      }
      updateHartaGroupDirect={
        updateHartaGroupDirect
      }
      updatePublicationPaceDirect={
        updatePublicationPaceDirect
      }
      handleImageUpload={
        handleImageUpload
      }
      saveCroppedImage={
        saveCroppedImage
      }
    />
  )
}

export default SeriesEditPage
