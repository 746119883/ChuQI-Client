import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

/** 统一的加载态:居中 + 旋转图标。 */
export function Loading({ text = '加载中…' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

/** 统一的空状态:居中图标 + 标题 + 可选副标题。 */
export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400">
          {icon}
        </div>
      )}
      <div>
        <p className="font-medium text-slate-500">{title}</p>
        {hint && <p className="text-sm text-slate-400 mt-1">{hint}</p>}
      </div>
    </div>
  )
}
