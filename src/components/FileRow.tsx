import { useState } from 'react'
import {
  Star, Download, Lock, FileText,
  Film, Music, Archive, File as FileIcon,
  Pencil, FolderInput, Trash2,
} from 'lucide-react'
import { useUpdateFile, useDeleteFile, useMoveFile, useFolders } from '@/hooks/useVault'
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

type IconConfig = { bg: string; icon: React.ReactNode }

function FileTypeIcon({ mime, url }: { mime: string; url: string }) {
  if (mime.startsWith('image/')) {
    return (
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-100">
        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    )
  }

  let cfg: IconConfig
  if (mime.startsWith('video/'))
    cfg = { bg: 'bg-rose-50', icon: <Film className="w-5 h-5 text-rose-500" /> }
  else if (mime.startsWith('audio/'))
    cfg = { bg: 'bg-purple-50', icon: <Music className="w-5 h-5 text-purple-500" /> }
  else if (mime === 'application/pdf')
    cfg = { bg: 'bg-red-50', icon: <FileText className="w-5 h-5 text-red-500" /> }
  else if (mime.startsWith('text/'))
    cfg = { bg: 'bg-slate-50', icon: <FileText className="w-5 h-5 text-slate-500" /> }
  else if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar'))
    cfg = { bg: 'bg-amber-50', icon: <Archive className="w-5 h-5 text-amber-600" /> }
  else
    cfg = { bg: 'bg-slate-50', icon: <FileIcon className="w-5 h-5 text-slate-400" /> }

  return (
    <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
      {cfg.icon}
    </div>
  )
}

function isPreviewable(mime: string): boolean {
  return mime.startsWith('image/') || mime === 'application/pdf'
}

function expiryStatus(expiresAt: string | null): 'expired' | 'urgent' | 'soon' | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff < 0) return 'expired'
  if (diff < 3 * 86400000) return 'urgent'
  if (diff < 14 * 86400000) return 'soon'
  return null
}

function ExpiryBadge({ expiresAt }: { expiresAt: string | null }) {
  const status = expiryStatus(expiresAt)
  if (!expiresAt) return null
  if (!status) return <span className="text-xs text-slate-400">到期 {expiresAt}</span>
  const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)
  const cfg = {
    expired: { cls: 'bg-red-100 text-red-600', label: '已过期' },
    urgent:  { cls: 'bg-orange-100 text-orange-600', label: days <= 0 ? '今天到期' : `${days}天后到期` },
    soon:    { cls: 'bg-yellow-50 text-yellow-700', label: `${days}天后到期` },
  }[status]
  return <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${cfg.cls}`}>{cfg.label}</span>
}

function MoveDialog({ file, onClose }: { file: VaultFile; onClose: () => void }) {
  const { data: folders } = useFolders(null)
  const move = useMoveFile()
  function doMove(folderId: number | null) {
    move.mutate({ id: file.id, folderId }, { onSuccess: onClose })
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-5 space-y-3">
        <h3 className="font-semibold text-slate-800">移动到…</h3>
        <ul className="space-y-1 max-h-56 overflow-y-auto">
          <li>
            <button type="button" onClick={() => doMove(null)}
              className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-slate-50 text-slate-600 flex items-center gap-2">
              <span className="text-base">📁</span> 根目录
            </button>
          </li>
          {(folders ?? []).filter(f => f.id !== file.folder).map(f => (
            <li key={f.id}>
              <button type="button" onClick={() => doMove(f.id)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2">
                <span className="text-base">📂</span> {f.name}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose}
          className="w-full py-2 text-sm border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          取消
        </button>
      </div>
    </div>
  )
}

export default function FileRow({ file, onPreview }: Props) {
  const { data: me } = useMe()
  const update = useUpdateFile(file.id)
  const del = useDeleteFile()
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(file.name)
  const [moving, setMoving] = useState(false)

  const isOwner = me?.id === file.uploader.id
  const previewable = isPreviewable(file.mime_type)
  const expiry = expiryStatus(file.expires_at)

  function saveRename() {
    const n = newName.trim()
    if (n && n !== file.name) update.mutate({ name: n })
    setRenaming(false)
  }

  const rowBg =
    expiry === 'expired' ? 'border-red-200 bg-red-50/50' :
    expiry === 'urgent'  ? 'border-orange-200 bg-orange-50/30' :
    'border-slate-100 bg-white'

  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border group transition-all hover:shadow-sm hover:border-slate-200 ${rowBg}`}>
        <FileTypeIcon mime={file.mime_type} url={file.file} />

        <div className="flex-1 min-w-0">
          {renaming ? (
            <div className="flex items-center gap-2">
              <input autoFocus value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') setRenaming(false) }}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button type="button" onClick={saveRename} className="text-xs font-semibold text-slate-900 hover:text-slate-600">保存</button>
              <button type="button" onClick={() => setRenaming(false)} className="text-xs text-slate-400">取消</button>
            </div>
          ) : (
            <button type="button"
              onClick={() => previewable ? onPreview(file) : window.open(file.file, '_blank')}
              className="text-left w-full group/name">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-slate-800 truncate group-hover/name:text-slate-900">{file.name}</span>
                {file.is_important && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                {file.visibility === 'private' && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs text-slate-400">
                  {formatBytes(file.size_bytes)} · {file.uploader.display_name} · {new Date(file.created_at).toLocaleDateString('zh-CN')}
                </span>
                <ExpiryBadge expiresAt={file.expires_at} />
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {isOwner && (
            <>
              <button type="button" onClick={() => { setNewName(file.name); setRenaming(true) }} title="重命名"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setMoving(true)} title="移动"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <FolderInput className="w-3.5 h-3.5" />
              </button>
              <button type="button"
                onClick={() => update.mutate({ is_important: !file.is_important })}
                title={file.is_important ? '取消重要' : '标记重要'}
                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                <Star className={`w-4 h-4 ${file.is_important ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </>
          )}
          <a href={file.file} download={file.name} title="下载"
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </a>
          {isOwner && (
            <button type="button"
              onClick={() => { if (confirm(`删除"${file.name}"?`)) del.mutate(file.id) }}
              title="删除"
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {moving && <MoveDialog file={file} onClose={() => setMoving(false)} />}
    </>
  )
}
