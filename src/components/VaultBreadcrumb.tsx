import { Link } from 'react-router-dom'
import { HardDrive, Users, ChevronRight } from 'lucide-react'
import type { VaultFolderBrief } from '@/lib/types'

interface Props {
  ancestors: VaultFolderBrief[]
  current?: string
  shared?: boolean
}

export default function VaultBreadcrumb({ ancestors, current, shared = false }: Props) {
  const root = shared
    ? { to: '/vault/shared', icon: <Users className="w-3.5 h-3.5" />, label: '共享空间' }
    : { to: '/vault', icon: <HardDrive className="w-3.5 h-3.5" />, label: '文件柜' }

  const folderBase = shared ? '/vault/shared/folders' : '/vault/folders'

  return (
    <nav className="flex items-center flex-wrap gap-0.5 text-sm">
      <Link
        to={root.to}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
      >
        {root.icon}
        <span>{root.label}</span>
      </Link>
      {ancestors.map((a) => (
        <span key={a.id} className="flex items-center gap-0.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            to={`${folderBase}/${a.id}`}
            className="text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
          >
            {a.name}
          </Link>
        </span>
      ))}
      {current && (
        <span className="flex items-center gap-0.5">
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-700 font-medium px-2 py-1">{current}</span>
        </span>
      )}
    </nav>
  )
}
