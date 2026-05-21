import {
  Star,
  Download,
  Lock,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  File as FileIcon,
} from 'lucide-react'
import { useUpdateFile, useDeleteFile } from '@/hooks/useVault'
import { useMe } from '@/hooks/useAuth'
import type { VaultFile } from '@/lib/types'

interface Props {
  file: VaultFile
  onPreview: (file: VaultFile) => void
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function FileTypeIcon({ mime }: { mime: string }) {
  const cls = 'w-8 h-8 shrink-0'
  if (mime.startsWith('image/')) return <ImageIcon className={`${cls} text-emerald-500`} />
  if (mime.startsWith('video/')) return <Film className={`${cls} text-rose-500`} />
  if (mime.startsWith('audio/')) return <Music className={`${cls} text-purple-500`} />
  if (mime === 'application/pdf') return <FileText className={`${cls} text-red-500`} />
  if (mime.startsWith('text/')) return <FileText className={`${cls} text-slate-500`} />
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar'))
    return <Archive className={`${cls} text-amber-600`} />
  return <FileIcon className={`${cls} text-slate-400`} />
}

function isPreviewable(mime: string): boolean {
  return mime.startsWith('image/') || mime === 'application/pdf'
}

export default function FileRow({ file, onPreview }: Props) {
  const { data: me } = useMe()
  const update = useUpdateFile(file.id)
  const del = useDeleteFile()

  const isOwner = me?.id === file.uploader.id
  const previewable = isPreviewable(file.mime_type)

  const toggleImportant = () =>
    update.mutate({ is_important: !file.is_important })

  const onDelete = () => {
    if (confirm(`删除"${file.name}"?`)) del.mutate(file.id)
  }

  const expiringSoon =
    file.expires_at &&
    new Date(file.expires_at).getTime() - Date.now() < 30 * 86400000

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl group">
      <FileTypeIcon mime={file.mime_type} />

      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={() => (previewable ? onPreview(file) : window.open(file.file, '_blank'))}
          className="text-left w-full"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{file.name}</span>
            {file.is_important && (
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}
            {file.visibility === 'private' && (
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </div>
          <div className="text-xs text-slate-400">
            {formatBytes(file.size_bytes)} · {file.uploader.username} ·{' '}
            {new Date(file.created_at).toLocaleDateString('zh-CN')}
            {file.expires_at && (
              <span className={expiringSoon ? 'text-rose-500 ml-1' : 'ml-1'}>
                · 到期 {file.expires_at}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isOwner && (
          <button
            type="button"
            onClick={toggleImportant}
            title={file.is_important ? '取消重要标记' : '标记为重要'}
            className="p-1.5 text-slate-400 hover:text-amber-500 rounded"
          >
            <Star
              className={`w-4 h-4 ${file.is_important ? 'fill-amber-500 text-amber-500' : ''}`}
            />
          </button>
        )}
        <a
          href={file.file}
          download={file.name}
          title="下载"
          className="p-1.5 text-slate-400 hover:text-slate-900 rounded"
        >
          <Download className="w-4 h-4" />
        </a>
        {isOwner && (
          <button
            type="button"
            onClick={onDelete}
            title="删除"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded text-xs"
          >
            删
          </button>
        )}
      </div>
    </div>
  )
}
