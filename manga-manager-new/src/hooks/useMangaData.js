import { useEffect, useState } from 'react'
import {
  defaultMagazines,
  defaultSeries
} from '../data/defaultData'
import {
  todayString
} from '../utils/issueUtils'

function useMangaData({
  navigate,
  selectedSeriesIds,
  setSelectedSeriesIds,
  bulkIssueValue,
  setBulkIssueValue
}) {
  const [magazineList, setMagazineList] =
    useState(() => {
      const saved =
        localStorage.getItem('magazines-v3')

      return saved
        ? JSON.parse(saved)
        : defaultMagazines
    })

  const [seriesList, setSeriesList] =
    useState(() => {
      const saved =
        localStorage.getItem('series-v2')

      return saved
        ? JSON.parse(saved)
        : defaultSeries
    })

  useEffect(() => {
    localStorage.setItem(
      'magazines-v3',
      JSON.stringify(magazineList)
    )
  }, [magazineList])

  useEffect(() => {
    localStorage.setItem(
      'series-v2',
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

    setMagazineList([
      ...magazineList,
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
    currentIssue
  ) => {
    setMagazineList(
      magazineList.map((magazine) => {
        return magazine.id === magazineId
          ? {
              ...magazine,
              name: newName,
              frequency: frequency,
              releaseDay: releaseDay,
              releaseDate: releaseDate,
              baseIssue: currentIssue,
              baseDate: todayString()
            }
          : magazine
      })
    )
  }

  const deleteMagazine = (magazineId) => {
    setMagazineList(
      magazineList.filter((magazine) => {
        return magazine.id !== magazineId
      })
    )

    setSeriesList(
      seriesList.filter((item) => {
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
        setMagazineList(
          magazineList.map((magazine) => {
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

  const saveNewSeries = ({
    magazineId,
    newSeriesTitle,
    newSeriesIssue,
    newSeriesImage,
    setNewSeriesTitle,
    setNewSeriesIssue,
    setNewSeriesImage
  }) => {
    if (newSeriesTitle.trim() === '') {
      return
    }

    const newSeries = {
      id: Date.now(),
      title: newSeriesTitle,
      magazineId: magazineId,
      issue: Number(newSeriesIssue),
      status: 'ongoing',
      image: newSeriesImage
    }

    setSeriesList([
      ...seriesList,
      newSeries
    ])

    setNewSeriesTitle('')
    setNewSeriesIssue(0)
    setNewSeriesImage('')

    navigate(
      `/magazine/${magazineId}`,
      { replace: true }
    )
  }

  const deleteSeries = (id) => {
    setSeriesList(
      seriesList.filter((item) => {
        return item.id !== id
      })
    )

    navigate(-1)
  }

  const saveEdit = (
    id,
    editTitle
  ) => {
    setSeriesList(
      seriesList.map((item) => {
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
      setSeriesList(
        seriesList.map((item) => {
          return item.id === id
            ? {
                ...item,
                issue: value
              }
            : item
        })
      )
    }

  const addIssue = (id) => {
    setSeriesList(
      seriesList.map((item) => {
        return item.id === id
          ? {
              ...item,
              issue: item.issue + 1
            }
          : item
      })
    )
  }

  const minusIssue = (id) => {
    setSeriesList(
      seriesList.map((item) => {
        return item.id === id
          ? {
              ...item,
              issue:
                item.issue > 0
                  ? item.issue - 1
                  : 0
            }
          : item
      })
    )
  }

  const bulkAddIssue = (magazineId) => {
    setSeriesList(
      seriesList.map((item) => {
        return (
          item.magazineId === magazineId &&
          item.status === 'ongoing'
        )
          ? {
              ...item,
              issue: item.issue + 1
            }
          : item
      })
    )
  }

  const bulkMinusIssue = (magazineId) => {
    setSeriesList(
      seriesList.map((item) => {
        if (
          item.magazineId === magazineId &&
          item.status === 'ongoing'
        ) {
          return {
            ...item,
            issue: Math.max(
              0,
              item.issue - 1
            )
          }
        }

        return item
      })
    )
  }

  const toggleStatus = (id) => {
    setSeriesList(
      seriesList.map((item) => {
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

    const targetIssue =
      Number(bulkIssueValue)

    setSeriesList(
      seriesList.map((item) => {
        if (
          selectedSeriesIds.includes(item.id)
        ) {
          return {
            ...item,
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
      setSeriesList(
        seriesList.map((item) => {
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
    addIssue,
    minusIssue,
    bulkAddIssue,
    bulkMinusIssue,
    toggleStatus,
    toggleSeriesSelection,
    bulkChangeSelectedIssue,
    handleImageUpload
  }
}

export default useMangaData