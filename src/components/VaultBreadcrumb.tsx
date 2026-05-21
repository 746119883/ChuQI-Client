import { Link } from 'react-router-dom'
import type { VaultFolderBrief } from '@/lib/types'

interface Props {
  ancestors: VaultFolderBrief[]
  current?: string  // 当前文件夹名;为空表示在根
}

export default function VaultBreadcrumb({ ancestors, current }: Props) {
  return (
    <nav className="text-sm text-slate-500 flex items-center flex-wrap gap-1">
      <Link to="/vault" className="hover:text-slate-900">
        文件柜
      </Link>
      {ancestors.map((a) => (
        <span key={a.id} className="flex items-center gap-1">
          <span>/</span>
          <Link to={`/vault/folders/${a.id}`} className="hover:text-slate-900">
            {a.name}
          </Link>
        </span>
      ))}
      {current && (
        <span className="flex items-center gap-1">
          <span>/</span>
          <span className="text-slate-900">{current}</span>
        </span>
      )}
    </nav>
  )
}
