import { useDeleteEvent } from '@/hooks/useEvents'
import { useMe } from '@/hooks/useAuth'
import type { EventOccurrence } from '@/lib/types'

interface Props {
  items: EventOccurrence[]
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  general: '事件',
  birthday: '生日',
  anniversary: '纪念日',
  memorial: '忌日',
  holiday: '节日',
}

function daysUntilLabel(dateStr: string): string {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  if (diff < 0) return `${-diff} 天前`
  if (diff < 30) return `${diff} 天后`
  if (diff < 365) return `${Math.round(diff / 30)} 个月后`
  return `${Math.round(diff / 365)} 年后`
}

function ageHint(occurrence: EventOccurrence): string | null {
  const ev = occurrence.event
  if (!ev.yearly_recurring || !ev.date_year) return null
  const target = new Date(occurrence.date + 'T00:00:00')
  const age = target.getFullYear() - ev.date_year
  if (age <= 0) return null
  if (ev.event_type === 'birthday') return `${age} 岁`
  if (ev.event_type === 'anniversary') return `${age} 周年`
  return null
}

export default function UpcomingList({ items }: Props) {
  const { data: me } = useMe()
  const del = useDeleteEvent()

  if (items.length === 0) {
    return (
      <p className="text-center text-slate-500 py-12">
        近期没有事件,点上方"新建事件"开始。
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((occ) => {
        const ev = occ.event
        const target = new Date(occ.date + 'T00:00:00')
        const isToday = daysUntilLabel(occ.date) === '今天'
        const isProfileBirthday = !!ev.is_profile_birthday
        const canDelete = !isProfileBirthday && me?.id === ev.owner.id
        const age = ageHint(occ)

        return (
          <article
            key={`${ev.id}-${occ.date}`}
            className={`flex items-center gap-4 bg-white rounded-xl p-4 ${
              isToday ? 'ring-2 ring-offset-1' : ''
            }`}
            style={isToday ? { '--tw-ring-color': ev.color } as React.CSSProperties : undefined}
          >
            {isProfileBirthday ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-pink-100 flex items-center justify-center relative">
                {ev.owner.avatar_url ? (
                  <img src={ev.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🎂</span>
                )}
                <span className="absolute bottom-0 inset-x-0 text-center text-[10px] bg-black/40 text-white leading-tight">
                  {target.getMonth() + 1}/{target.getDate()}
                </span>
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white shrink-0"
                style={{ backgroundColor: ev.color }}
              >
                <div className="text-xs leading-none">
                  {target.getFullYear() !== new Date().getFullYear()
                    ? target.getFullYear()
                    : EVENT_TYPE_LABEL[ev.event_type]}
                </div>
                <div className="text-lg font-semibold leading-none mt-1">
                  {target.getMonth() + 1}/{target.getDate()}
                </div>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-slate-900 truncate">{ev.title}</h3>
                {age && (
                  <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                    {age}
                  </span>
                )}
                {ev.visibility === 'private' && (
                  <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                    私密
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                <span
                  className={isToday ? 'font-medium' : ''}
                  style={isToday ? { color: ev.color } : undefined}
                >
                  {daysUntilLabel(occ.date)}
                </span>
                {ev.is_lunar && occ.lunar_label && (
                  <> · 农历{occ.lunar_label}</>
                )}
                <> · {ev.owner.display_name || ev.owner.username}</>
                {isProfileBirthday && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded">
                    资料生日
                  </span>
                )}
              </div>
              {ev.description && (
                <div className="text-sm text-slate-600 mt-1 truncate">
                  {ev.description}
                </div>
              )}
            </div>

            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`删除"${ev.title}"?`)) del.mutate(ev.id as number)
                }}
                className="text-xs text-slate-400 hover:text-rose-600 shrink-0"
              >
                删
              </button>
            )}
          </article>
        )
      })}
    </div>
  )
}
