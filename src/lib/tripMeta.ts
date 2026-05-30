import type { TripItemType, TripStatus } from './types'

export const ITEM_TYPES: { value: TripItemType; label: string; icon: string }[] = [
  { value: 'transport', label: '交通', icon: '✈️' },
  { value: 'hotel', label: '住宿', icon: '🏨' },
  { value: 'activity', label: '景点活动', icon: '📷' },
  { value: 'food', label: '餐饮', icon: '🍜' },
  { value: 'ticket', label: '门票预订', icon: '🎫' },
  { value: 'info', label: '实用信息', icon: 'ℹ️' },
  { value: 'other', label: '其他', icon: '📌' },
]

export const ITEM_TYPE_META: Record<TripItemType, { label: string; icon: string }> =
  Object.fromEntries(ITEM_TYPES.map((t) => [t.value, { label: t.label, icon: t.icon }])) as Record<
    TripItemType,
    { label: string; icon: string }
  >

export const STATUS_META: Record<TripStatus, { label: string; cls: string }> = {
  planning: { label: '计划中', cls: 'bg-amber-50 text-amber-700' },
  ongoing: { label: '进行中', cls: 'bg-emerald-50 text-emerald-700' },
  done: { label: '已结束', cls: 'bg-slate-100 text-slate-500' },
}

export function dateRangeLabel(start: string, end: string | null): string {
  if (!end || end === start) return start
  return `${start} → ${end}`
}
