const DB_NAME = 'manga-manager-db'
const DB_VERSION = 1
const IMAGE_STORE = 'images'

let dbPromise = null

function openImageDb() {
  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise(
    (resolve, reject) => {
      const request =
        indexedDB.open(
          DB_NAME,
          DB_VERSION
        )

      request.onupgradeneeded = () => {
        const db = request.result

        if (
          !db.objectStoreNames.contains(
            IMAGE_STORE
          )
        ) {
          db.createObjectStore(
            IMAGE_STORE,
            {
              keyPath: 'id'
            }
          )
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    }
  )

  return dbPromise
}

function createImageId() {
  const random =
    crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random()
          .toString(36)
          .slice(2)

  return `image_${Date.now()}_${random}`
}

async function withImageStore(
  mode,
  callback
) {
  const db =
    await openImageDb()

  return new Promise(
    (resolve, reject) => {
      const tx =
        db.transaction(
          IMAGE_STORE,
          mode
        )

      const store =
        tx.objectStore(IMAGE_STORE)

      let result

      try {
        result = callback(store)
      } catch (error) {
        reject(error)
        return
      }

      tx.oncomplete = () => {
        resolve(result)
      }

      tx.onerror = () => {
        reject(tx.error)
      }

      tx.onabort = () => {
        reject(tx.error)
      }
    }
  )
}

export async function putImageBlob(
  imageId,
  blob
) {
  await withImageStore(
    'readwrite',
    (store) => {
      store.put({
        id: imageId,
        blob,
        updatedAt: new Date().toISOString()
      })
    }
  )

  return imageId
}

export async function saveImageBlob(blob) {
  const imageId =
    createImageId()

  await putImageBlob(
    imageId,
    blob
  )

  return imageId
}

export async function getImageBlob(
  imageId
) {
  if (!imageId) {
    return null
  }

  const db =
    await openImageDb()

  return new Promise(
    (resolve, reject) => {
      const tx =
        db.transaction(
          IMAGE_STORE,
          'readonly'
        )

      const request =
        tx
          .objectStore(IMAGE_STORE)
          .get(imageId)

      request.onsuccess = () => {
        resolve(
          request.result?.blob || null
        )
      }

      request.onerror = () => {
        reject(request.error)
      }
    }
  )
}

export async function getImageUrl(
  imageId
) {
  const blob =
    await getImageBlob(imageId)

  return blob
    ? URL.createObjectURL(blob)
    : ''
}

export async function deleteImage(
  imageId
) {
  if (!imageId) {
    return
  }

  await withImageStore(
    'readwrite',
    (store) => {
      store.delete(imageId)
    }
  )
}

export async function cleanupUnusedImages(
  usedImageIds
) {
  const usedSet =
    new Set(
      Array.from(usedImageIds)
        .filter(Boolean)
    )

  await withImageStore(
    'readwrite',
    (store) => {
      const request =
        store.openCursor()

      request.onsuccess = () => {
        const cursor =
          request.result

        if (!cursor) {
          return
        }

        if (!usedSet.has(cursor.key)) {
          cursor.delete()
        }

        cursor.continue()
      }
    }
  )
}

export async function getImageStorageStats() {
  const db =
    await openImageDb()

  return new Promise(
    (resolve, reject) => {
      const tx =
        db.transaction(
          IMAGE_STORE,
          'readonly'
        )

      const request =
        tx
          .objectStore(IMAGE_STORE)
          .openCursor()

      let count = 0
      let totalBytes = 0

      request.onsuccess = () => {
        const cursor =
          request.result

        if (!cursor) {
          resolve({
            count,
            totalMB:
              Math.round(
                (totalBytes / 1024 / 1024) *
                  10
              ) / 10
          })
          return
        }

        count += 1
        totalBytes +=
          cursor.value?.blob?.size || 0

        cursor.continue()
      }

      request.onerror = () => {
        reject(request.error)
      }
    }
  )
}

export function dataUrlToBlob(dataUrl) {
  const [header, base64] =
    dataUrl.split(',')

  const mime =
    header
      .match(/data:(.*?);base64/)?.[1] ||
    'image/jpeg'

  const binary =
    atob(base64)

  const bytes =
    new Uint8Array(binary.length)

  for (
    let i = 0;
    i < binary.length;
    i += 1
  ) {
    bytes[i] =
      binary.charCodeAt(i)
  }

  return new Blob(
    [bytes],
    {
      type: mime
    }
  )
}

export function blobToDataUrl(blob) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader()

      reader.onload = () => {
        resolve(reader.result)
      }

      reader.onerror = () => {
        reject(reader.error)
      }

      reader.readAsDataURL(blob)
    }
  )
}

export async function getImageBackupEntries(
  imageIds
) {
  const entries = []

  for (const imageId of imageIds) {
    if (!imageId) {
      continue
    }

    const blob =
      await getImageBlob(imageId)

    if (!blob) {
      continue
    }

    entries.push({
      id: imageId,
      type: blob.type,
      dataUrl: await blobToDataUrl(blob)
    })
  }

  return entries
}

export async function restoreImageBackupEntries(
  entries = []
) {
  for (const entry of entries) {
    if (
      !entry?.id ||
      !entry?.dataUrl
    ) {
      continue
    }

    await putImageBlob(
      entry.id,
      dataUrlToBlob(entry.dataUrl)
    )
  }
}
