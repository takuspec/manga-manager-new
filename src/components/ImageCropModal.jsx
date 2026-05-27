import { useState } from 'react'
import Cropper from 'react-easy-crop'
import cropImage from '../utils/cropImage'

function ImageCropModal({
  image,
  onSave,
  onCancel
}) {
  const [crop, setCrop] =
    useState({ x: 0, y: 0 })

  const [zoom, setZoom] =
    useState(1)

  const [
    croppedAreaPixels,
    setCroppedAreaPixels
  ] = useState(null)

  if (!image) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 9999
      }}
    >

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 140
        }}
      >
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={3 / 4}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(
            croppedArea,
            croppedAreaPixels
          ) => {
            setCroppedAreaPixels(
              croppedAreaPixels
            )
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 82,
          padding: '0 24px'
        }}
      >
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) =>
            setZoom(
              Number(e.target.value)
            )
          }
          style={{
            width: '100%'
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 24,
          display: 'flex',
          justifyContent: 'center',
          gap: '12px'
        }}
      >

        <button
          type="button"
          onClick={onCancel}
        >
          キャンセル
        </button>

        <button
          type="button"
          onClick={async () => {
            if (!croppedAreaPixels) {
              return
            }

            const croppedImage =
              await cropImage(
                image,
                croppedAreaPixels
              )

            onSave(croppedImage)
          }}
        >
          保存
        </button>

      </div>

    </div>
  )
}

export default ImageCropModal