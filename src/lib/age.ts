/** 根据出生日期字符串(YYYY-MM-DD)计算整岁年龄；无生日返回 null。 */
export function ageInYears(birthday: string | null | undefined): number | null {
  if (!birthday) return null
  const b = new Date(birthday)
  if (isNaN(b.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}
