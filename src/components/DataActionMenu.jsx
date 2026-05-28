import { useRef, useState } from 'react'

function DataActionMenu({
  onBackupData,
  onImportData,
  onWeeklySettings
}) {
  const [isOpen, setIsOpen] =
    useState(false)

  const fileInputRef =
    useRef(null)

  const handleBackup = async () => {
    const ok =
      window.confirm(
        'バックアップしますか？'
      )

    if (!ok) {
      return
    }

    try {
      await onBackupData()
      setIsOpen(false)
    } catch {
      window.alert(
        'バックアップに失敗しました。'
      )
    }
  }

  const handleImportButtonClick = () => {
    const ok =
      window.confirm(
        'インポートしますか？'
      )

    if (!ok) {
      return
    }

    fileInputRef.current?.click()
  }

  const handleImportFileChange =
    async (e) => {
      const file =
        e.target.files?.[0]

      e.target.value = ''

      if (!file) {
        return
      }

      try {
        await onImportData(file)
        window.alert('インポートしました。')
        setIsOpen(false)
      } catch {
        window.alert(
          'インポートに失敗しました。バックアップファイルを確認してください。'
        )
      }
    }

  return (
    <div className="data-action">
      <button
        type="button"
        className="page-settings-button"
        aria-label="データメニュー"
        onClick={() =>
          setIsOpen(!isOpen)
        }
      >
        ⚙
      </button>

      {isOpen && (
        <div className="data-action-menu">
          {onWeeklySettings && (
            <button
              type="button"
              onClick={() => {
                onWeeklySettings()
                setIsOpen(false)
              }}
            >
              週刊誌情報
            </button>
          )}

          <button
            type="button"
            onClick={handleImportButtonClick}
          >
            データインポート
          </button>

          <button
            type="button"
            onClick={handleBackup}
          >
            バックアップ
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        className="data-import-input"
        type="file"
        accept="application/json,.json"
        onChange={handleImportFileChange}
      />
    </div>
  )
}

export default DataActionMenu
