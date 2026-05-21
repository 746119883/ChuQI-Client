import { useEffect } from 'react'
import { Download } from 'lucide-react'
import type { VaultFile } from '@/lib/types'

interface Props {
  file: VaultFile
  onClose: () => void
}

export default function FilePreview({ file, onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const isImage = file.mime_type.startsWith('image/')
  const isPdf = file.mime_type === 'application/pdf'

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex flex-col"
      onClick={onClose}
    >
      <header
        className="flex items-center justify-between px-6 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0">
          <h2 className="font-medium truncate">{file.name}</h2>
          <div className="text-xs text-white/60">{file.uploader.username}</div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <a
            href={file.file}
            download={file.name}
            className="p-2 hover:bg-white/10 rounded"
            title="下载"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-3xl px-2 hover:bg-white/10 rounded"
          >
            ×
          </button>
        </div>
      </header>

      <div
        className="flex-1 flex items-center justify-center overflow-auto px-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={file.file}
            alt={file.name}
            className="max-w-full max-h-full object-contain"
          />
        )}
        {isPdf && (
          <iframe
            src={file.file}
            title={file.name}
            className="w-full h-full bg-white rounded"
          />
        )}
        {!isImage && !isPdf && (
          <div className="text-white text-center space-y-3">
            <p>无法在线预览此文件类型。</p>
            <a
              href={file.file}
              download={file.name}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded"
            >
              <Download className="w-4 h-4" />
              下载文件
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
