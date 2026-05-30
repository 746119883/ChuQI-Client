import type { RecipeCategory, RecipeDifficulty } from './types'

export const CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: 'meat', label: '荤菜' },
  { value: 'veg', label: '素菜' },
  { value: 'soup', label: '汤羹' },
  { value: 'staple', label: '主食' },
  { value: 'breakfast', label: '早餐' },
  { value: 'dessert', label: '甜点' },
  { value: 'drink', label: '饮品' },
  { value: 'other', label: '其他' },
]

export const CATEGORY_LABEL: Record<RecipeCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label]),
) as Record<RecipeCategory, string>

export const DIFFICULTIES: { value: RecipeDifficulty; label: string }[] = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '有点难' },
]

export const DIFFICULTY_LABEL: Record<RecipeDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '有点难',
}
