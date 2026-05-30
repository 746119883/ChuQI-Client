import type { MilestoneType } from './types'

export const MILESTONE_TYPES: { value: MilestoneType; label: string; icon: string }[] = [
  { value: 'birth', label: '新生', icon: '👶' },
  { value: 'marriage', label: '婚姻', icon: '💍' },
  { value: 'home', label: '安家', icon: '🏠' },
  { value: 'graduation', label: '毕业', icon: '🎓' },
  { value: 'career', label: '事业', icon: '💼' },
  { value: 'travel', label: '旅行', icon: '✈️' },
  { value: 'pet', label: '宠物', icon: '🐾' },
  { value: 'honor', label: '喜事', icon: '🎉' },
  { value: 'other', label: '其他', icon: '⭐' },
]

export const MILESTONE_META: Record<MilestoneType, { label: string; icon: string }> =
  Object.fromEntries(
    MILESTONE_TYPES.map((t) => [t.value, { label: t.label, icon: t.icon }]),
  ) as Record<MilestoneType, { label: string; icon: string }>
