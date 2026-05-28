export default async function cropImage(
  imageSrc,
  crop
) {
  const maxWidth = 600
  const maxHeight = 800
  const jpegQuality = 0.78

  const image =
    await createImage(imageSrc)

  const scale =
    Math.min(
      1,
      maxWidth / crop.width,
      maxHeight / crop.height
    )

  const outputWidth =
    Math.round(crop.width * scale)

  const outputHeight =
    Math.round(crop.height * scale)

  const canvas =
    document.createElement('canvas')

  const ctx =
    canvas.getContext('2d')

  if (!ctx) {
    throw new Error(
      'Canvas context is not available'
    )
  }

  canvas.width = outputWidth
  canvas.height = outputHeight

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight
  )

  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                'Failed to create image blob'
              )
            )
            return
          }

          resolve(blob)
        },
        'image/jpeg',
        jpegQuality
      )
    }
  )
}

function createImage(src) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image()

      image.addEventListener(
        'load',
        () => resolve(image)
      )

      image.addEventListener(
        'error',
        reject
      )

      image.setAttribute(
        'crossOrigin',
        'anonymous'
      )

      image.src = src
    }
  )
}
