import { Link } from 'react-router-dom'
import { FolderOpen, Lock, Trash2 } from 'lucide-react'
import type { VaultFolder } from '@/lib/types'

interface Props {
  folder: VaultFolder
  onDelete?: (id: number) => void
  canDelete?: boolean
  shared?: boolean
}

const FOLDER_COLORS = [
  'from-amber-400 to-orange-400',
  'from-sky-400 to-blue-500',
  'from-emerald-400 to-teal-500',
  'from-violet-400 to-purple-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
]

function folderColor(id: number) {
  return FOLDER_COLORS[id % FOLDER_COLORS.length]
}

export default function FolderCard({ folder, onDelete, canDelete, shared = false }: Props) {
  const href = shared ? `/vault/shared/folders/${folder.id}` : `/vault/folders/${folder.id}`
  return (
    <div className="group relative">
      <Link
        to={href}
        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${folderColor(folder.id)} flex items-center justify-center shrink-0 shadow-sm`}>
          <FolderOpen className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-800 truncate">{folder.name}</h3>
            {folder.visibility === 'private' && (
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{folder.item_count} 项内容</p>
        </div>
      </Link>
      {canDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            if (confirm(`删除文件夹"${folder.name}"?里面所有内容会一起删除。`)) {
              onDelete(folder.id)
            }
          }}
          className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="删除文件夹"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
