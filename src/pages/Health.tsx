import { Link } from 'react-router-dom'
import { useHealthProfiles } from '@/hooks/useHealth'

export default function Health() {
  const { data: members = [], isLoading } = useHealthProfiles()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        加载中…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">家庭健康</h1>
        <Link to="/health/settings" className="text-sm text-slate-400 hover:text-slate-600">提醒设置</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((m) => (
          <Link
            key={m.id}
            to={`/health/${m.id}`}
            className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
              {m.avatar_url ? (
                <img src={m.avatar_url} alt={m.display_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl text-slate-400">
                  {m.display_name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{m.display_name}</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {m.health_profile.blood_type
                  ? `血型：${m.health_profile.blood_type === 'unknown' ? '不确定' : m.health_profile.blood_type}`
                  : '档案未完善'}
              </p>
            </div>
            <span className="text-slate-300 text-lg">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
