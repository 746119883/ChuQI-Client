import type { MealType, OptionKind } from './types'

export const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'snack', label: '加餐' },
]

export const MEAL_TYPE_LABEL: Record<MealType, string> = Object.fromEntries(
  MEAL_TYPES.map((m) => [m.value, m.label]),
) as Record<MealType, string>

export const OPTION_KINDS: { value: OptionKind; label: string; emoji: string }[] = [
  { value: 'home', label: '在家做', emoji: '🍳' },
  { value: 'takeout', label: '外卖', emoji: '🛵' },
  { value: 'dineout', label: '出去吃', emoji: '🍜' },
]

export const OPTION_KIND_LABEL: Record<OptionKind, string> = Object.fromEntries(
  OPTION_KINDS.map((k) => [k.value, k.label]),
) as Record<OptionKind, string>

export const OPTION_KIND_EMOJI: Record<OptionKind, string> = Object.fromEntries(
  OPTION_KINDS.map((k) => [k.value, k.emoji]),
) as Record<OptionKind, string>
