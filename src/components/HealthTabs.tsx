import { Link } from 'react-router-dom'

export type HealthTab = 'profile' | 'checkups' | 'vaccines' | 'visits'

const TABS: { key: HealthTab; label: string; suffix: string }[] = [
  { key: 'profile', label: '档案', suffix: '' },
  { key: 'checkups', label: '体检', suffix: '/checkups' },
  { key: 'vaccines', label: '疫苗', suffix: '/vaccines' },
  { key: 'visits', label: '就医', suffix: '/visits' },
]

export default function HealthTabs({ userId, active }: { userId: number; active: HealthTab }) {
  return (
    <div className="flex gap-2 border-b border-slate-200">
      {TABS.map((t) => (
        <Link
          key={t.key}
          to={`/health/${userId}${t.suffix}`}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            t.key === active
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
