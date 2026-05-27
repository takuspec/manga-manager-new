import { useState } from 'react'
import {
  Routes,
  Route,
  useNavigate,
  useParams
} from 'react-router-dom'
import './App.css'

import MagazineListPage from './pages/MagazineListPage'
import MagazineSeriesPage from './pages/MagazineSeriesPage'
import MagazineEditPage from './pages/MagazineEditPage'
import CompletedPage from './pages/CompletedPage'
import SeriesAddPage from './pages/SeriesAddPage'
import SeriesEditPage from './pages/SeriesEditPage'

import useMangaData from './hooks/useMangaData'

import {
  getEstimatedLatestIssue,
  getEstimatedLatestIssueInfo,
  getIssueSerial
} from './utils/issueUtils'

function App() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] =
    useState('list')

  const [sortMode, setSortMode] =
    useState('unread')

  const [showCompleted, setShowCompleted] =
    useState(true)

  const [menuSeriesId, setMenuSeriesId] =
    useState(null)

  const [selectedSeriesIds, setSelectedSeriesIds] =
    useState([])

  const [bulkIssueValue, setBulkIssueValue] =
    useState('')

  const [newMagazineName, setNewMagazineName] =
    useState('')

  const [newSeriesTitle, setNewSeriesTitle] =
    useState('')

  const [newSeriesIssue, setNewSeriesIssue] =
    useState(0)

  const [newSeriesImage, setNewSeriesImage] =
    useState('')

  const [editTitle, setEditTitle] =
    useState('')

  const {
    magazineList,
    seriesList,
    addMagazine,
    saveMagazineEdit,
    deleteMagazine,
    handleMagazineImageUpload,
    saveNewSeries,
    deleteSeries,
    saveEdit,
    updateIssueDirect,
    addIssue,
    minusIssue,
    bulkAddIssue,
    bulkMinusIssue,
    toggleStatus,
    toggleSeriesSelection,
    bulkChangeSelectedIssue,
    handleImageUpload
  } = useMangaData({
    navigate,
    selectedSeriesIds,
    setSelectedSeriesIds,
    bulkIssueValue,
    setBulkIssueValue
  })

  const getMagazineName = (magazineId) => {
    const magazine =
      magazineList.find((item) => {
        return item.id === magazineId
      })

    return magazine
      ? magazine.name
      : '不明な雑誌'
  }

  const getUnreadCount = (item) => {
    const magazine =
      magazineList.find((magazine) => {
        return magazine.id === item.magazineId
      })

    if (
      !magazine ||
      item.status === 'completed'
    ) {
      return 0
    }

    const latest =
      getEstimatedLatestIssueInfo(magazine)

    const readYear =
      item.issueYear ||
      new Date().getFullYear()

    const latestSerial =
      getIssueSerial(
        latest.year,
        latest.issue,
        magazine
      )

    const readSerial =
      getIssueSerial(
        readYear,
        item.issue,
        magazine
      )

    return Math.max(
      latestSerial - readSerial,
      0
    )
  }

  const getMagazineCover = (magazine) => {
    if (magazine.image) {
      return magazine.image
    }

    const firstSeriesWithImage =
      seriesList.find((item) => {
        return (
          item.magazineId === magazine.id &&
          item.image
        )
      })

    return firstSeriesWithImage
      ? firstSeriesWithImage.image
      : ''
  }

  return (
    <Routes>

      <Route
        path="/"
        element={
          <MagazineListPage
            magazineList={magazineList}
            seriesList={seriesList}
            newMagazineName={newMagazineName}
            setNewMagazineName={setNewMagazineName}
            addMagazine={() =>
              addMagazine(
                newMagazineName,
                setNewMagazineName
              )
            }
            getUnreadCount={getUnreadCount}
            getMagazineCover={getMagazineCover}
            getEstimatedLatestIssue={
              getEstimatedLatestIssue
            }
            navigate={navigate}
          />
        }
      />

      <Route
        path="/magazine/:magazineId"
        element={
          <MagazineSeriesPage
            magazineList={magazineList}
            seriesList={seriesList}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortMode={sortMode}
            setSortMode={setSortMode}
            showCompleted={showCompleted}
            setShowCompleted={setShowCompleted}
            menuSeriesId={menuSeriesId}
            setMenuSeriesId={setMenuSeriesId}
            selectedSeriesIds={selectedSeriesIds}
            bulkIssueValue={bulkIssueValue}
            setBulkIssueValue={setBulkIssueValue}
            getUnreadCount={getUnreadCount}
            getEstimatedLatestIssue={
              getEstimatedLatestIssue
            }
            addIssue={addIssue}
            minusIssue={minusIssue}
            bulkAddIssue={bulkAddIssue}
            bulkMinusIssue={bulkMinusIssue}
            bulkChangeSelectedIssue={
              bulkChangeSelectedIssue
            }
            toggleSeriesSelection={
              toggleSeriesSelection
            }
            toggleStatus={toggleStatus}
            deleteSeries={deleteSeries}
            navigate={navigate}
            useParams={useParams}
          />
        }
      />

      <Route
        path="/magazine/:magazineId/edit"
        element={
          <MagazineEditPage
            magazineList={magazineList}
            getEstimatedLatestIssue={
              getEstimatedLatestIssue
            }
            saveMagazineEdit={saveMagazineEdit}
            deleteMagazine={deleteMagazine}
            handleMagazineImageUpload={
              handleMagazineImageUpload
            }
            navigate={navigate}
            useParams={useParams}
          />
        }
      />

      <Route
        path="/completed"
        element={
          <CompletedPage
            seriesList={seriesList}
            getMagazineName={getMagazineName}
            navigate={navigate}
          />
        }
      />

      <Route
        path="/magazine/:magazineId/add"
        element={
          <SeriesAddPage
            magazineList={magazineList}
            newSeriesTitle={newSeriesTitle}
            setNewSeriesTitle={setNewSeriesTitle}
            newSeriesIssue={newSeriesIssue}
            setNewSeriesIssue={setNewSeriesIssue}
            newSeriesImage={newSeriesImage}
            setNewSeriesImage={setNewSeriesImage}
            saveNewSeries={(magazineId) =>
              saveNewSeries({
                magazineId,
                newSeriesTitle,
                newSeriesIssue,
                newSeriesImage,
                setNewSeriesTitle,
                setNewSeriesIssue ,
                setNewSeriesImage
              })
            }
            navigate={navigate}
          />
        }
      />

      <Route
        path="/series/:seriesId"
        element={
          <SeriesEditPage
            seriesList={seriesList}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            saveEdit={(id) =>
              saveEdit(id, editTitle)
            }
            updateIssueDirect={updateIssueDirect}
            handleImageUpload={handleImageUpload}
            navigate={navigate}
          />
        }
      />

    </Routes>
  )
}

export default App