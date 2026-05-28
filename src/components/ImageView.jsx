import { useEffect, useState } from 'react'
import {
  getImageUrl
} from '../utils/imageDb'

function ImageView({
  imageId,
  imageBlob,
  fallbackImage,
  alt = ''
}) {
  const [imageUrl, setImageUrl] =
    useState('')

  useEffect(() => {
    let isActive = true
    let objectUrl = ''

    const loadImage = async () => {
      if (imageBlob) {
        objectUrl =
          URL.createObjectURL(imageBlob)

        if (isActive) {
          setImageUrl(objectUrl)
        }

        return
      }

      if (imageId) {
        try {
          objectUrl =
            await getImageUrl(imageId)

          if (isActive) {
            setImageUrl(
              objectUrl || fallbackImage || ''
            )
          } else if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
          }
        } catch (error) {
          console.error(error)

          if (isActive) {
            setImageUrl(fallbackImage || '')
          }
        }

        return
      }

      setImageUrl(fallbackImage || '')
    }

    loadImage()

    return () => {
      isActive = false

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [
    imageId,
    imageBlob,
    fallbackImage
  ])

  if (!imageUrl) {
    return (
      <div className="no-image">
        NO IMAGE
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
    />
  )
}

export default ImageView
