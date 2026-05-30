import { Link } from 'react-router-dom'
import { useTrips } from '@/hooks/useTrips'
import { STATUS_META, dateRangeLabel } from '@/lib/tripMeta'
import { Loading } from '@/components/StateView'

export default function Trips() {
  const { data, isLoading } = useTrips()
  const trips = data?.results ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">旅行</h1>
        <Link
          to="/trips/new"
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          + 新旅行
        </Link>
      </div>

      {isLoading && <Loading />}
      {!isLoading && trips.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          还没有旅行，点右上「+ 新旅行」记录行程吧。
        </p>
      )}

      <div className="space-y-4">
        {trips.map((t) => {
          const st = STATUS_META[t.status]
          return (
            <Link
              key={t.id}
              to={`/trips/${t.id}`}
              className="block bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                <div className="w-28 sm:w-40 shrink-0 bg-slate-100 aspect-[4/3]">
                  {t.cover_url ? (
                    <img src={t.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🧳</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 p-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium text-slate-900 truncate">{t.title}</h2>
                    <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  {t.destination && (
                    <div className="text-sm text-slate-500 mt-1">📍 {t.destination}</div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {dateRangeLabel(t.start_date, t.end_date)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{t.item_count} 项行程</div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}