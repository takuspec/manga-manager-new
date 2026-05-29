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
import CompletedSeriesPage from './pages/CompletedSeriesPage'
import WeeklySettingsPage from './pages/WeeklySettingsPage'
import WeeklyIssueRulesPage from './pages/WeeklyIssueRulesPage'

import {
  getEstimatedLatestIssue,
  getEstimatedLatestIssueInfo,
  getUnreadIssueCount
} from './utils/issueUtils'

function App() {
  const navigate = useNavigate()

  const [viewMode, setViewMode] =
    useState('list')

  const [sortMode, setSortMode] =
    useState('unread')

  const [sortDirection, setSortDirection] =
    useState('desc')

  const [showCompleted, setShowCompleted] =
    useState(true)

  const [menuSeriesId, setMenuSeriesId] =
    useState(null)

  const [selectedSeriesIds, setSelectedSeriesIds] =
    useState([])

  const [bulkIssueValue, setBulkIssueValue] =
    useState('')

  const [bulkIssueYear, setBulkIssueYear] =
    useState(new Date().getFullYear())

  const [newMagazineName, setNewMagazineName] =
    useState('')

  const [newSeriesTitle, setNewSeriesTitle] =
    useState('')

  const [
    newSeriesStartIssueYear,
    setNewSeriesStartIssueYear
  ] = useState(new Date().getFullYear())

  const [
    newSeriesStartIssue,
    setNewSeriesStartIssue
  ] = useState(1)

  const [
    newSeriesIssueYear,
    setNewSeriesIssueYear
  ] = useState(new Date().getFullYear())

  const [newSeriesIssue, setNewSeriesIssue] =
    useState(0)

  const [
    newSeriesHartaGroup,
    setNewSeriesHartaGroup
  ] = useState('ha')

  const [newSeriesImage, setNewSeriesImage] =
    useState('')

  const [editTitle, setEditTitle] =
    useState('')

  const {
    magazineList,
    seriesList,
    storageErrorMessage,
    clearStorageErrorMessage,
    addMagazine,
    saveMagazineEdit,
    deleteMagazine,
    moveMagazine,
    handleMagazineImageUpload,
    saveNewSeries,
    deleteSeries,
    updateStartIssueDirect,
    updateHartaGroupDirect,
    saveEdit,
    updateIssueDirect,
    updateIssueYearDirect,
    addIssue,
    minusIssue,
    bulkAddIssue,
    bulkMinusIssue,
    toggleStatus,
    toggleSeriesSelection,
    bulkChangeSelectedIssue,
    saveCroppedImage,
    saveCroppedMagazineImage,
    backupData,
    importData,
    updateWeeklyIssueRule,
    updateWeeklyIssueRules,
    handleImageUpload
  } = useMangaData({
    navigate,
    setSelectedSeriesIds,
    selectedSeriesIds,
    bulkIssueValue,
    bulkIssueYear,
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

    return getUnreadIssueCount(
      item,
      magazine,
      latest
    )
  }

  const getMagazineCover = (magazine) => {
    if (
      magazine.imageId ||
      magazine.image
    ) {
      return {
        imageId: magazine.imageId || '',
        image: magazine.image || ''
      }
    }

    const firstSeriesWithImage =
      seriesList.find((item) => {
        return (
          item.magazineId === magazine.id &&
          (
            item.imageId ||
            item.image
          )
        )
      })

    return firstSeriesWithImage
      ? {
          imageId:
            firstSeriesWithImage.imageId || '',
          image:
            firstSeriesWithImage.image || ''
        }
      : {
          imageId: '',
          image: ''
        }
  }

  return (
    <>
    {storageErrorMessage && (
      <div className="storage-error-banner">
        <span>
          {storageErrorMessage}
        </span>

        <button
          type="button"
          onClick={clearStorageErrorMessage}
        >
          閉じる
        </button>
      </div>
    )}

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
            onBackupData={backupData}
            onImportData={importData}
            moveMagazine={moveMagazine}
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
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            showCompleted={showCompleted}
            setShowCompleted={setShowCompleted}
            menuSeriesId={menuSeriesId}
            setMenuSeriesId={setMenuSeriesId}
            selectedSeriesIds={selectedSeriesIds}
            setSelectedSeriesIds={
              setSelectedSeriesIds
            }
            bulkIssueValue={bulkIssueValue}
            setBulkIssueValue={setBulkIssueValue}
            bulkIssueYear={bulkIssueYear}
            setBulkIssueYear={setBulkIssueYear}
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
            saveCroppedMagazineImage={
              saveCroppedMagazineImage
            }
            navigate={navigate}
            useParams={useParams}
          />
        }
      />

      <Route
        path="/weekly-settings"
        element={
          <WeeklySettingsPage
            magazineList={magazineList}
            navigate={navigate}
          />
        }
      />

      <Route
        path="/weekly-settings/:magazineId"
        element={
          <WeeklyIssueRulesPage
            magazineList={magazineList}
            updateWeeklyIssueRule={
              updateWeeklyIssueRule
            }
            updateWeeklyIssueRules={
              updateWeeklyIssueRules
            }
            navigate={navigate}
          />
        }
      />

      <Route
        path="/completed"
        element={
          <CompletedPage
            magazineList={magazineList}
            seriesList={seriesList}
            getMagazineCover={getMagazineCover}
            onBackupData={backupData}
            onImportData={importData}
            navigate={navigate}
          />
        }
      />

      <Route
        path="/completed/:magazineId"
        element={
          <CompletedSeriesPage
            magazineList={magazineList}
            seriesList={seriesList}
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
            newSeriesStartIssueYear={newSeriesStartIssueYear}
            setNewSeriesStartIssueYear={setNewSeriesStartIssueYear}
            newSeriesStartIssue={newSeriesStartIssue}
            setNewSeriesStartIssue={setNewSeriesStartIssue}
            newSeriesIssueYear={newSeriesIssueYear}
            setNewSeriesIssueYear={setNewSeriesIssueYear}
            newSeriesIssue={newSeriesIssue}
            setNewSeriesIssue={setNewSeriesIssue}
            newSeriesImage={newSeriesImage}
            setNewSeriesImage={setNewSeriesImage}
            newSeriesHartaGroup={newSeriesHartaGroup}
            setNewSeriesHartaGroup={setNewSeriesHartaGroup}
            saveNewSeries={(magazineId) =>
              saveNewSeries({
                magazineId,
                newSeriesTitle,
                newSeriesStartIssueYear,
                newSeriesStartIssue,
                newSeriesIssueYear,
                newSeriesIssue,
                newSeriesImage,
                newSeriesHartaGroup,
                setNewSeriesTitle,
                setNewSeriesStartIssueYear,
                setNewSeriesStartIssue,
                setNewSeriesIssueYear,
                setNewSeriesIssue,
                setNewSeriesHartaGroup,
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
            magazineList={magazineList}
            seriesList={seriesList}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            saveEdit={saveEdit}
            updateIssueDirect={updateIssueDirect}
            updateIssueYearDirect={updateIssueYearDirect}
            updateStartIssueDirect={updateStartIssueDirect}
            updateHartaGroupDirect={updateHartaGroupDirect}
            handleImageUpload={handleImageUpload}
            saveCroppedImage={saveCroppedImage}
            navigate={navigate}
          />
        }
      />

    </Routes>
    </>
  )
}

export default App
