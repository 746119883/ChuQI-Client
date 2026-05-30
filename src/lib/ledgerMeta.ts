import type { LedgerCategory } from './types'

export const EXPENSE_CATEGORIES: { value: LedgerCategory; label: string }[] = [
  { value: 'food', label: '餐饮' },
  { value: 'shopping', label: '购物' },
  { value: 'appliance', label: '家电' },
  { value: 'travel', label: '旅行' },
  { value: 'medical', label: '医疗' },
  { value: 'education', label: '教育' },
  { value: 'social', label: '人情红包' },
  { value: 'housing', label: '住房物业' },
  { value: 'transport', label: '交通' },
  { value: 'other', label: '其他' },
]

export const INCOME_CATEGORIES: { value: LedgerCategory; label: string }[] = [
  { value: 'salary', label: '工资' },
  { value: 'bonus', label: '奖金' },
  { value: 'other', label: '其他' },
]

export const CATEGORY_LABEL: Record<LedgerCategory, string> = {
  food: '餐饮', shopping: '购物', appliance: '家电', travel: '旅行',
  medical: '医疗', education: '教育', social: '人情红包', housing: '住房物业',
  transport: '交通', salary: '工资', bonus: '奖金', other: '其他',
}

// 分类配色（用于分类占比条）
export const CATEGORY_COLOR: Record<LedgerCategory, string> = {
  food: '#f97316', shopping: '#ec4899', appliance: '#3b82f6', travel: '#06b6d4',
  medical: '#ef4444', education: '#8b5cf6', social: '#f59e0b', housing: '#10b981',
  transport: '#6366f1', salary: '#22c55e', bonus: '#14b8a6', other: '#94a3b8',
}

export function yuan(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
