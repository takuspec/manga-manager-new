import { useEffect, useState } from 'react'
import {
  defaultMagazines,
  defaultSeries
} from '../data/defaultData'
import {
  todayString,
  getHartaYearMonthFromVolume,
  getNextPublishedIssue,
  getPrevPublishedIssue
} from '../utils/issueUtils'
import {
  normalizeHartaGroup
} from '../utils/hartaGroups'
import {
  cleanupUnusedImages,
  dataUrlToBlob,
  deleteImage,
  getImageBackupEntries,
  getImageStorageStats,
  restoreImageBackupEntries,
  saveImageBlob
} from '../utils/imageDb'

const MAGAZINE_STORAGE_KEY = 'magazines-v3'
const SERIES_STORAGE_KEY = 'series-v2'
const IMAGE_MIGRATION_COMPLETE_KEY =
  'image-migration-complete-v1'
const LEGACY_IMAGE_MIGRATION_LIMIT = 5

let hasShownStorageAlert = false

function isImageDataUrl(value) {
  return (
    typeof value === 'string' &&
    value.startsWith('data:image/')
  )
}

async function saveImageValue(imageValue) {
  if (!imageValue) {
    return ''
  }

  if (imageValue instanceof Blob) {
    return saveImageBlob(imageValue)
  }

  if (isImageDataUrl(imageValue)) {
    return saveImageBlob(
      dataUrlToBlob(imageValue)
    )
  }

  return ''
}

function collectUsedImageIds(
  magazineList,
  seriesList
) {
  return [
    ...magazineList.map((item) => {
      return item.imageId
    }),
    ...seriesList.map((item) => {
      return item.imageId
    })
  ].filter(Boolean)
}

function safeSetLocalStorage(
  key,
  value
) {
  try {
    localStorage.setItem(
      key,
      value
    )
  } catch (error) {
    console.error(error)

    if (!hasShownStorageAlert) {
      hasShownStorageAlert = true
      window.alert(
        '保存容量が上限に達しました。画像を減らすかバックアップしてください。'
      )
    }
  }
}

function safeSetLocalStorageWithDiagnostics(
  key,
  value,
  onError
) {
  const sizeKB =
    new Blob([value]).size / 1024

  console.log(
    `${key} size KB:`,
    sizeKB.toFixed(1)
  )

  if (value.includes('data:image/')) {
    console.warn(
      `${key} still contains image DataURL data.`
    )
  }

  try {
    localStorage.setItem(
      key,
      value
    )
  } catch (error) {
    console.error(error)

    if (!hasShownStorageAlert) {
      hasShownStorageAlert = true
      const message =
        '保存容量が上限に達しました。画像を減らすかバックアップしてください。'

      onError?.(message)

      window.alert(message)
    }
  }
}

function waitForIdle() {
  return new Promise((resolve) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(resolve, {
        timeout: 800
      })
      return
    }

    window.setTimeout(resolve, 0)
  })
}

async function migrateLegacyImagesInListSafely(
  list,
  budget = {
    count: 0,
    limit: Infinity
  }
) {
  let changed = false
  let hasRemaining = false
  const nextList = []

  for (const item of list) {
    if (
      item.imageId ||
      !isImageDataUrl(item.image)
    ) {
      nextList.push(item)
      continue
    }

    if (budget.count >= budget.limit) {
      hasRemaining = true
      nextList.push(item)
      continue
    }

    await waitForIdle()

    try {
      const imageId =
        await saveImageValue(item.image)

      budget.count += 1
      changed = true

      nextList.push({
        ...item,
        imageId,
        image: ''
      })
    } catch (error) {
      console.error(error)
      hasRemaining = true
      nextList.push(item)
    }
  }

  return {
    list: nextList,
    changed,
    hasRemaining
  }
}

function useMangaData({
  navigate,
  selectedSeriesIds,
  setSelectedSeriesIds,
  bulkIssueYear,
  bulkIssueValue,
  setBulkIssueValue
}) {
  const [magazineList, setMagazineList] =
    useState(() => {
      const saved =
        localStorage.getItem(
          MAGAZINE_STORAGE_KEY
        )

      return saved
        ? JSON.parse(saved)
        : defaultMagazines
    })

  const [seriesList, setSeriesList] =
    useState(() => {
      const saved =
        localStorage.getItem(
          SERIES_STORAGE_KEY
        )

      return saved
        ? JSON.parse(saved)
        : defaultSeries
    })

  const [
    storageErrorMessage,
    setStorageErrorMessage
  ] = useState('')

  useEffect(() => {
    let cancelled = false

    const migrateImages = async () => {
      if (
        localStorage.getItem(
          IMAGE_MIGRATION_COMPLETE_KEY
        ) === 'true'
      ) {
        return
      }

      const budget = {
        count: 0,
        limit: LEGACY_IMAGE_MIGRATION_LIMIT
      }

      const migratedMagazines =
        await migrateLegacyImagesInListSafely(
          magazineList,
          budget
        )

      const migratedSeries =
        await migrateLegacyImagesInListSafely(
          seriesList,
          budget
        )

      if (cancelled) {
        return
      }

      if (migratedMagazines.changed) {
        setMagazineList(
          migratedMagazines.list
        )
      }

      if (migratedSeries.changed) {
        setSeriesList(
          migratedSeries.list
        )
      }

      await cleanupUnusedImages(
        collectUsedImageIds(
          migratedMagazines.list,
          migratedSeries.list
        )
      )

      const hasRemaining =
        migratedMagazines.hasRemaining ||
        migratedSeries.hasRemaining

      if (!hasRemaining) {
        localStorage.setItem(
          IMAGE_MIGRATION_COMPLETE_KEY,
          'true'
        )
      }

      const stats =
        await getImageStorageStats()

      console.log(
        'image storage:',
        stats
      )
    }

    migrateImages().catch((error) => {
      console.error(error)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    safeSetLocalStorageWithDiagnostics(
      MAGAZINE_STORAGE_KEY,
      JSON.stringify(magazineList),
      setStorageErrorMessage
    )
  }, [magazineList])

  useEffect(() => {
    safeSetLocalStorageWithDiagnostics(
      SERIES_STORAGE_KEY,
      JSON.stringify(seriesList),
      setStorageErrorMessage
    )
  }, [seriesList])

  const addMagazine = (newMagazineName, setNewMagazineName) => {
    if (newMagazineName.trim() === '') {
      return
    }

    const newMagazine = {
      id: Date.now(),
      name: newMagazineName,
      frequency: 'weekly',
      releaseDay: 1,
      releaseDate: 1,
      baseDate: todayString(),
      baseIssue: 1,
      weeklyIssueRules: {},
      imageId: '',
      image: ''
    }

    setMagazineList((prevList) => [
      ...prevList,
      newMagazine
    ])

    setNewMagazineName('')
  }

  const saveMagazineEdit = async (
    magazineId,
    newName,
    frequency,
    releaseDay,
    releaseDate,
    currentIssueYear,
    currentIssue,
    imageBlob,
    oldImageId
  ) => {
    const newImageId =
      await saveImageValue(imageBlob)

    setMagazineList((prevList) =>
      prevList.map((magazine) => {
        if (magazine.id !== magazineId) {
          return magazine
        }

        return {
          ...magazine,
          name: newName,
          frequency: frequency,
          releaseDay: releaseDay,
          releaseDate: releaseDate,
          baseIssueYear: currentIssueYear,
          baseIssue: currentIssue,
          baseDate: todayString(),
          ...(newImageId
            ? {
                imageId: newImageId,
                image: ''
              }
            : {})
        }
      })
    )

    if (
      newImageId &&
      oldImageId &&
      oldImageId !== newImageId
    ) {
      await deleteImage(oldImageId)
    }
  }

  const deleteMagazine = (magazineId) => {
    const imageIdsToDelete = [
      ...magazineList
        .filter((magazine) => {
          return magazine.id === magazineId
        })
        .map((magazine) => {
          return magazine.imageId
        }),
      ...seriesList
        .filter((item) => {
          return item.magazineId === magazineId
        })
        .map((item) => {
          return item.imageId
        })
    ].filter(Boolean)

    setMagazineList((prevList) =>
      prevList.filter((magazine) => {
        return magazine.id !== magazineId
      })
    )

    setSeriesList((prevList) =>
      prevList.filter((item) => {
        return item.magazineId !== magazineId
      })
    )

    imageIdsToDelete.forEach((imageId) => {
      deleteImage(imageId).catch((error) => {
        console.error(error)
      })
    })

    navigate('/')
  }

  const moveMagazine = (
    fromIndex,
    toIndex
  ) => {
    setMagazineList((prevList) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prevList.length ||
        toIndex >= prevList.length
      ) {
        return prevList
      }

      const nextList = [...prevList]
      const [movedMagazine] =
        nextList.splice(fromIndex, 1)

      nextList.splice(
        toIndex,
        0,
        movedMagazine
      )

      return nextList
    })
  }

  const handleMagazineImageUpload =
    async (e, magazineId) => {
      const file = e.target.files[0]

      if (!file) {
        return
      }

      const newImageId =
        await saveImageBlob(file)

      let oldImageId = ''

      setMagazineList((prevList) =>
        prevList.map((magazine) => {
          if (magazine.id !== magazineId) {
            return magazine
          }

          oldImageId =
            magazine.imageId || ''

          return {
            ...magazine,
            imageId: newImageId,
            image: ''
          }
        })
      )

      if (oldImageId) {
        await deleteImage(oldImageId)
      }
    }

  const saveCroppedMagazineImage = async (
    magazineId,
    croppedImage,
    oldImageId
  ) => {
    const newImageId =
      await saveImageValue(croppedImage)

    if (!newImageId) {
      return
    }

    setMagazineList((prevList) =>
      prevList.map((magazine) => {
        return magazine.id === magazineId
          ? {
              ...magazine,
              imageId: newImageId,
              image: ''
            }
          : magazine
      })
    )

    if (
      oldImageId &&
      oldImageId !== newImageId
    ) {
      await deleteImage(oldImageId)
    }
  }

  const saveNewSeries = async ({
    magazineId,
    newSeriesTitle,
    newSeriesStartIssueYear,
    newSeriesStartIssue,
    newSeriesIssueYear,
    newSeriesIssue,
    newSeriesImage,
    setNewSeriesTitle,
    setNewSeriesHartaGroup,
    setNewSeriesStartIssueYear,
    setNewSeriesStartIssue,
    setNewSeriesIssueYear,
    setNewSeriesIssue,
    newSeriesHartaGroup,
    setNewSeriesImage
  }) => {
    if (newSeriesTitle.trim() === '') {
      return
    }

    const magazine =
      magazineList.find((magazine) => {
        return magazine.id === magazineId
      })

    const isHarta =
      magazine?.frequency === 'harta'

    const startIssue =
      Number(newSeriesStartIssue)

    const issue =
      Number(newSeriesIssue)

    const startIssueYear =
      isHarta && startIssue > 0
        ? getHartaYearMonthFromVolume(
            startIssue
          ).year
        : Number(newSeriesStartIssueYear)

    const issueYear =
      isHarta && issue > 0
        ? getHartaYearMonthFromVolume(
            issue
          ).year
        : Number(newSeriesIssueYear)

    const imageId =
      await saveImageValue(newSeriesImage)

  const newSeries = {
    id: Date.now(),
    title: newSeriesTitle,
    magazineId: magazineId,

    startIssueYear: startIssueYear,
    startIssue: startIssue,

    issueYear: issueYear,
    issue: issue,

    hartaGroup: newSeriesHartaGroup,

    status: 'ongoing',
    imageId: imageId,
    image: ''
  }

    setSeriesList((prevList) => [
      ...prevList,
      newSeries
    ])

    setNewSeriesTitle('')
    setNewSeriesStartIssueYear(new Date().getFullYear())
    setNewSeriesStartIssue(1)
    setNewSeriesIssueYear(new Date().getFullYear())
    setNewSeriesIssue(0)
    setNewSeriesHartaGroup('ha')
    setNewSeriesImage('')

    navigate(
      `/magazine/${magazineId}`,
      { replace: true }
    )
  }

  const deleteSeries = (id) => {
    const oldImageId =
      seriesList.find((item) => {
        return item.id === id
      })?.imageId

    setSeriesList((prevList) =>
      prevList.filter((item) => {
        return item.id !== id
      })
    )

    if (oldImageId) {
      deleteImage(oldImageId).catch((error) => {
        console.error(error)
      })
    }

    navigate(-1)
  }

  const saveEdit = (
    id,
    editTitle
  ) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        return item.id === id
          ? {
              ...item,
              title: editTitle
            }
          : item
      })
    )
  }

  const updateIssueDirect =
    (id, value) => {
      setSeriesList((prevList) =>
        prevList.map((item) => {
          return item.id === id
            ? {
                ...item,
                issue: value
              }
            : item
        })
      )
    }

  const updateIssueYearDirect =
    (id, value) => {
      setSeriesList((prevList) =>
        prevList.map((item) => {
          return item.id === id
            ? {
                ...item,
                issueYear: value
              }
            : item
        })
      )
    }
  
    const updateStartIssueDirect =
    (id, year, issue) => {
      setSeriesList((prevList) =>
        prevList.map((item) => {
          return item.id === id
            ? {
                ...item,
                startIssueYear: year,
                startIssue: issue
              }
            : item
        })
      )
    }
  
  const updateHartaGroupDirect =
    (id, hartaGroup) => {
      setSeriesList((prevList) =>
        prevList.map((item) => {
          return item.id === id
            ? {
                ...item,
                hartaGroup: hartaGroup
              }
            : item
        })
      )
    }

  const updateWeeklyIssueRule = (
    magazineId,
    year,
    finalIssue
  ) => {
    const normalizedIssue =
      Number(finalIssue) === 53
        ? 53
        : 52

    setMagazineList((prevList) =>
      prevList.map((magazine) => {
        if (magazine.id !== magazineId) {
          return magazine
        }

        return {
          ...magazine,
          weeklyIssueRules: {
            ...(magazine.weeklyIssueRules || {}),
            [year]: normalizedIssue
          }
        }
      })
    )
  }

  const updateWeeklyIssueRules = (
    magazineId,
    rules
  ) => {
    setMagazineList((prevList) =>
      prevList.map((magazine) => {
        if (magazine.id !== magazineId) {
          return magazine
        }

        return {
          ...magazine,
          weeklyIssueRules: {
            ...(magazine.weeklyIssueRules || {}),
            ...rules
          }
        }
      })
    )
  }

  const addIssue = (id) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (item.id !== id) {
          return item
        }

        const magazine =
          magazineList.find((magazine) => {
            return magazine.id === item.magazineId
          })

        if (!magazine) {
          return item
        }

        const next =
          getNextPublishedIssue(
            item,
            item.issueYear ||
              new Date().getFullYear(),
            item.issue,
            magazine
          )

        return {
          ...item,
          issueYear: next.year,
          issue: next.issue
        }
      })
    )
  }

  const minusIssue = (id) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (item.id !== id) {
          return item
        }

        const magazine =
          magazineList.find((magazine) => {
            return magazine.id === item.magazineId
          })

        if (!magazine) {
          return item
        }

        const prev =
          getPrevPublishedIssue(
            item,
            item.issueYear ||
              new Date().getFullYear(),
            item.issue,
            magazine
          )

        return {
          ...item,
          issueYear: prev.year,
          issue: prev.issue
        }
      })
    )
  }

  const bulkAddIssue = (magazineId) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (
          item.magazineId !== magazineId ||
          item.status !== 'ongoing'
        ) {
          return item
        }

        const magazine =
          magazineList.find((magazine) => {
            return magazine.id === item.magazineId
          })

        if (!magazine) {
          return item
        }

        const next =
          getNextPublishedIssue(
            item,
            item.issueYear ||
              new Date().getFullYear(),
            item.issue,
            magazine
          )

        return {
          ...item,
          issueYear: next.year,
          issue: next.issue
        }
      })
    )
  }

  const bulkMinusIssue = (magazineId) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (
          item.magazineId !== magazineId ||
          item.status !== 'ongoing'
        ) {
          return item
        }

        const magazine =
          magazineList.find((magazine) => {
            return magazine.id === item.magazineId
          })

        if (!magazine) {
          return item
        }

        const prev =
          getPrevPublishedIssue(
            item,
            item.issueYear ||
              new Date().getFullYear(),
            item.issue,
            magazine
          )

        return {
          ...item,
          issueYear: prev.year,
          issue: prev.issue
        }
      })
    )
  }

  const bulkAddIssueByHartaGroups = (
    magazineId,
    selectedGroups = []
  ) => {
    const targetMagazine =
      magazineList.find((magazine) => {
        return magazine.id === magazineId
      })

    const targetGroups =
      new Set(
        selectedGroups.map((group) => {
          return normalizeHartaGroup(group)
        })
      )

    if (
      !targetMagazine ||
      targetMagazine.frequency !== 'harta' ||
      targetGroups.size === 0
    ) {
      return
    }

    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (
          item.magazineId !== magazineId ||
          item.status !== 'ongoing' ||
          !targetGroups.has(
            normalizeHartaGroup(
              item.hartaGroup
            )
          )
        ) {
          return item
        }

        const next =
          getNextPublishedIssue(
            item,
            item.issueYear ||
              new Date().getFullYear(),
            item.issue,
            targetMagazine
          )

        return {
          ...item,
          issueYear: next.year,
          issue: next.issue
        }
      })
    )
  }

  const bulkMinusIssueByHartaGroups = (
    magazineId,
    selectedGroups = []
  ) => {
    const targetMagazine =
      magazineList.find((magazine) => {
        return magazine.id === magazineId
      })

    const targetGroups =
      new Set(
        selectedGroups.map((group) => {
          return normalizeHartaGroup(group)
        })
      )

    if (
      !targetMagazine ||
      targetMagazine.frequency !== 'harta' ||
      targetGroups.size === 0
    ) {
      return
    }

    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (
          item.magazineId !== magazineId ||
          item.status !== 'ongoing' ||
          !targetGroups.has(
            normalizeHartaGroup(
              item.hartaGroup
            )
          )
        ) {
          return item
        }

        const prev =
          getPrevPublishedIssue(
            item,
            item.issueYear ||
              new Date().getFullYear(),
            item.issue,
            targetMagazine
          )

        return {
          ...item,
          issueYear: prev.year,
          issue: prev.issue
        }
      })
    )
  }

  const toggleStatus = (id) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        return item.id === id
          ? {
              ...item,
              status:
                item.status === 'ongoing'
                  ? 'completed'
                  : 'ongoing'
            }
          : item
      })
    )
  }

  const toggleSeriesSelection = (id) => {
    if (selectedSeriesIds.includes(id)) {
      setSelectedSeriesIds(
        selectedSeriesIds.filter((seriesId) => {
          return seriesId !== id
        })
      )

      return
    }

    setSelectedSeriesIds([
      ...selectedSeriesIds,
      id
    ])
  }

  const bulkChangeSelectedIssue = () => {
    if (bulkIssueValue === '') {
      return
    }

    const targetYear =
      Number(bulkIssueYear)

    const targetIssue =
      Number(bulkIssueValue)

    setSeriesList((prevList) =>
      prevList.map((item) => {
        if (
          selectedSeriesIds.includes(item.id)
        ) {
          return {
            ...item,
            issueYear: targetYear,
            issue: targetIssue
          }
        }

        return item
      })
    )

    setSelectedSeriesIds([])
    setBulkIssueValue('')
  }

  const handleImageUpload = async (e, id) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    const newImageId =
      await saveImageBlob(file)

    const oldImageId =
      seriesList.find((item) => {
        return item.id === id
      })?.imageId

    setSeriesList((prevList) =>
      prevList.map((item) => {
        return item.id === id
          ? {
              ...item,
              imageId: newImageId,
              image: ''
            }
          : item
      })
    )

    if (oldImageId) {
      await deleteImage(oldImageId)
    }
  }

  const saveCroppedImage = async (
    id,
    croppedImage,
    oldImageId
  ) => {
    const newImageId =
      await saveImageValue(croppedImage)

    if (!newImageId) {
      return
    }

    setSeriesList((prevList) =>
      prevList.map((item) => {
        return item.id === id
          ? {
              ...item,
              imageId: newImageId,
              image: ''
            }
          : item
      })
    )

    if (
      oldImageId &&
      oldImageId !== newImageId
    ) {
      await deleteImage(oldImageId)
    }
  }

  const backupData = async () => {
    const usedImageIds =
      collectUsedImageIds(
        magazineList,
        seriesList
      )

    const images =
      await getImageBackupEntries(
        usedImageIds
      )

    const backup = {
      app: 'manga-manager',
      version: 2,
      exportedAt: new Date().toISOString(),
      storageKeys: {
        magazines: MAGAZINE_STORAGE_KEY,
        series: SERIES_STORAGE_KEY
      },
      magazines: magazineList,
      series: seriesList,
      images: images
    }

    const blob =
      new Blob(
        [
          JSON.stringify(
            backup,
            null,
            2
          )
        ],
        {
          type: 'application/json'
        }
      )

    const url =
      URL.createObjectURL(blob)

    const timestamp =
      new Date()
        .toISOString()
        .replace(/[:.]/g, '-')

    const link =
      document.createElement('a')

    link.href = url
    link.download =
      `manga-manager-backup-${timestamp}.json`

    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader =
        new FileReader()

      reader.onload = async () => {
        try {
          const data =
            JSON.parse(reader.result)

          const importedMagazines =
            data.magazines ||
            data.magazineList ||
            data[MAGAZINE_STORAGE_KEY] ||
            data.storage?.[MAGAZINE_STORAGE_KEY]

          const importedSeries =
            data.series ||
            data.seriesList ||
            data[SERIES_STORAGE_KEY] ||
            data.storage?.[SERIES_STORAGE_KEY]

          if (
            !Array.isArray(importedMagazines) ||
            !Array.isArray(importedSeries)
          ) {
            throw new Error(
              'Invalid backup data'
            )
          }

          await restoreImageBackupEntries(
            data.images || []
          )

          const nextMagazines =
            await migrateLegacyImagesInListSafely(
              importedMagazines,
              {
                count: 0,
                limit: Infinity
              }
            )

          const nextSeries =
            await migrateLegacyImagesInListSafely(
              importedSeries,
              {
                count: 0,
                limit: Infinity
              }
            )

          safeSetLocalStorageWithDiagnostics(
            MAGAZINE_STORAGE_KEY,
            JSON.stringify(nextMagazines.list),
            setStorageErrorMessage
          )

          safeSetLocalStorageWithDiagnostics(
            SERIES_STORAGE_KEY,
            JSON.stringify(nextSeries.list),
            setStorageErrorMessage
          )

          setMagazineList(nextMagazines.list)
          setSeriesList(nextSeries.list)
          setSelectedSeriesIds([])
          setBulkIssueValue('')

          await cleanupUnusedImages(
            collectUsedImageIds(
              nextMagazines.list,
              nextSeries.list
            )
          )

          if (
            !nextMagazines.hasRemaining &&
            !nextSeries.hasRemaining
          ) {
            localStorage.setItem(
              IMAGE_MIGRATION_COMPLETE_KEY,
              'true'
            )
          } else {
            localStorage.removeItem(
              IMAGE_MIGRATION_COMPLETE_KEY
            )
          }

          resolve()
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.readAsText(file)
    })
  }

  return {
    magazineList,
    seriesList,
    storageErrorMessage,
    clearStorageErrorMessage: () =>
      setStorageErrorMessage(''),
    addMagazine,
    saveMagazineEdit,
    deleteMagazine,
    moveMagazine,
    handleMagazineImageUpload,
    saveNewSeries,
    deleteSeries,
    saveEdit,
    updateIssueDirect,
    updateIssueYearDirect,
    addIssue,
    minusIssue,
    bulkAddIssue,
    bulkMinusIssue,
    bulkAddIssueByHartaGroups,
    bulkMinusIssueByHartaGroups,
    toggleStatus,
    toggleSeriesSelection,
    bulkChangeSelectedIssue,
    updateStartIssueDirect,
    saveCroppedImage,
    saveCroppedMagazineImage,
    backupData,
    importData,
    updateWeeklyIssueRule,
    updateWeeklyIssueRules,
    updateHartaGroupDirect,
    handleImageUpload
  }
}

export default useMangaData
