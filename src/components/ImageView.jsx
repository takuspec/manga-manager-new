import {
  useEffect,
  useRef,
  useState
} from 'react'
import {
  getImageUrl
} from '../utils/imageDb'

function scheduleRevokeObjectUrl(url) {
  if (!url?.startsWith('blob:')) {
    return
  }

  const revoke = () => {
    URL.revokeObjectURL(url)
  }

  requestAnimationFrame(() => {
    setTimeout(revoke, 0)
  })
}

function ImageView({
  imageId,
  imageBlob,
  fallbackImage,
  alt = ''
}) {
  const [imageUrl, setImageUrl] =
    useState('')

  const objectUrlRef =
    useRef('')

  const mountedRef =
    useRef(false)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      const objectUrl =
        objectUrlRef.current

      objectUrlRef.current = ''

      scheduleRevokeObjectUrl(objectUrl)
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const commitImageUrl = (nextUrl) => {
      if (!isActive || !mountedRef.current) {
        scheduleRevokeObjectUrl(nextUrl)
        return
      }

      const nextObjectUrl =
        nextUrl?.startsWith('blob:')
          ? nextUrl
          : ''

      const previousObjectUrl =
        objectUrlRef.current

      objectUrlRef.current =
        nextObjectUrl

      setImageUrl(nextUrl || '')

      if (
        previousObjectUrl &&
        previousObjectUrl !== nextObjectUrl
      ) {
        scheduleRevokeObjectUrl(
          previousObjectUrl
        )
      }
    }

    const loadImage = async () => {
      if (imageBlob) {
        const nextUrl =
          URL.createObjectURL(imageBlob)

        commitImageUrl(nextUrl)
        return
      }

      if (!imageId) {
        commitImageUrl(fallbackImage || '')
        return
      }

      try {
        const nextUrl =
          await getImageUrl(imageId)

        commitImageUrl(
          nextUrl || fallbackImage || ''
        )
      } catch (error) {
        console.error(error)

        if (isActive) {
          commitImageUrl(fallbackImage || '')
        }
      }
    }

    loadImage()

    return () => {
      isActive = false
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
