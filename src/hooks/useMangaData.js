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

const MAGAZINE_STORAGE_KEY = 'magazines-v3'
const SERIES_STORAGE_KEY = 'series-v2'

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

  useEffect(() => {
    localStorage.setItem(
      MAGAZINE_STORAGE_KEY,
      JSON.stringify(magazineList)
    )
  }, [magazineList])

  useEffect(() => {
    localStorage.setItem(
      SERIES_STORAGE_KEY,
      JSON.stringify(seriesList)
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
      image: ''
    }

    setMagazineList((prevList) => [
      ...prevList,
      newMagazine
    ])

    setNewMagazineName('')
  }

  const saveMagazineEdit = (
    magazineId,
    newName,
    frequency,
    releaseDay,
    releaseDate,
    currentIssueYear,
    currentIssue,
    image
  ) => {
    setMagazineList((prevList) =>
      prevList.map((magazine) => {
        return magazine.id === magazineId
          ? {
              ...magazine,
              name: newName,
              frequency: frequency,
              releaseDay: releaseDay,
              releaseDate: releaseDate,
              baseIssueYear: currentIssueYear,
              baseIssue: currentIssue,
              baseDate: todayString(),
              image: image
            }
          : magazine
      })
    )
  }

  const deleteMagazine = (magazineId) => {
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

    navigate('/')
  }

  const handleMagazineImageUpload =
    (e, magazineId) => {
      const file = e.target.files[0]

      if (!file) {
        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        setMagazineList((prevList) =>
          prevList.map((magazine) => {
            return magazine.id === magazineId
              ? {
                  ...magazine,
                  image: reader.result
                }
              : magazine
          })
        )
      }

      reader.readAsDataURL(file)
    }

  const saveCroppedMagazineImage = (
    magazineId,
    croppedImage
  ) => {
    setMagazineList((prevList) =>
      prevList.map((magazine) => {
        return magazine.id === magazineId
          ? {
              ...magazine,
              image: croppedImage
            }
          : magazine
      })
    )
  }

  const saveNewSeries = ({
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
    image: newSeriesImage
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
    setSeriesList((prevList) =>
      prevList.filter((item) => {
        return item.id !== id
      })
    )

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

  const handleImageUpload = (e, id) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setSeriesList((prevList) =>
        prevList.map((item) => {
          return item.id === id
            ? {
                ...item,
                image: reader.result
              }
            : item
        })
      )
    }

    reader.readAsDataURL(file)
  }

  const saveCroppedImage = (
    id,
    croppedImage
  ) => {
    setSeriesList((prevList) =>
      prevList.map((item) => {
        return item.id === id
          ? {
              ...item,
              image: croppedImage
            }
          : item
      })
    )
  }

  const backupData = () => {
    const backup = {
      app: 'manga-manager',
      version: 1,
      exportedAt: new Date().toISOString(),
      storageKeys: {
        magazines: MAGAZINE_STORAGE_KEY,
        series: SERIES_STORAGE_KEY
      },
      magazines: magazineList,
      series: seriesList
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

      reader.onload = () => {
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

          localStorage.setItem(
            MAGAZINE_STORAGE_KEY,
            JSON.stringify(importedMagazines)
          )

          localStorage.setItem(
            SERIES_STORAGE_KEY,
            JSON.stringify(importedSeries)
          )

          setMagazineList(importedMagazines)
          setSeriesList(importedSeries)
          setSelectedSeriesIds([])
          setBulkIssueValue('')

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
    addMagazine,
    saveMagazineEdit,
    deleteMagazine,
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
    toggleStatus,
    toggleSeriesSelection,
    bulkChangeSelectedIssue,
    updateStartIssueDirect,
    saveCroppedImage,
    saveCroppedMagazineImage,
    backupData,
    importData,
    updateHartaGroupDirect,
    handleImageUpload
  }
}

export default useMangaData
