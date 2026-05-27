import { useParams } from 'react-router-dom'
import SeriesAdd from '../components/SeriesAdd'

function SeriesAddPage({
  magazineList,
  newSeriesTitle,
  setNewSeriesTitle,
  newSeriesIssue,
  setNewSeriesIssue,
  newSeriesImage,
  setNewSeriesImage,
  saveNewSeries,
  navigate
}) {
  const params = useParams()

  const magazineId =
    Number(params.magazineId)

  const magazine =
    magazineList.find((item) => {
      return item.id === magazineId
    })

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
    <SeriesAdd
      newSeriesTitle={newSeriesTitle}
      setNewSeriesTitle={setNewSeriesTitle}
      newSeriesIssue={newSeriesIssue}
      setNewSeriesIssue={setNewSeriesIssue}
      newSeriesImage={newSeriesImage}
      setNewSeriesImage={setNewSeriesImage}
      saveNewSeries={() =>
        saveNewSeries(magazineId)
      }
      goBack={() =>
        navigate(
          `/magazine/${magazineId}`,
          { replace: true }
        )
      }
    />
  )
}

export default SeriesAddPage