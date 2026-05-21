import { Link } from 'react-router-dom'
import { Folder, Lock } from 'lucide-react'
import type { VaultFolder } from '@/lib/types'

interface Props {
  folder: VaultFolder
  onDelete?: (id: number) => void
  canDelete?: boolean
}

export default function FolderCard({ folder, onDelete, canDelete }: Props) {
  return (
    <div className="group relative">
      <Link
        to={`/vault/folders/${folder.id}`}
        className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
      >
        <Folder className="w-8 h-8 text-amber-500 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-medium text-slate-900 truncate">{folder.name}</h3>
            {folder.visibility === 'private' && (
              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400">{folder.item_count} 项</p>
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
          className="absolute top-1 right-1 px-1.5 py-0.5 text-xs text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          删
        </button>
      )}
    </div>
  )
}
