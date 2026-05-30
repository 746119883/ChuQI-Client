import { useMoments } from '@/hooks/useMoments'
import MomentCard from '@/components/MomentCard'
import MomentComposer from '@/components/MomentComposer'
import OnThisDay from '@/components/OnThisDay'
import { Loading } from '@/components/StateView'

export default function Feed() {
  const { data, isLoading, error } = useMoments()

  return (
    <div className="space-y-4">
      <OnThisDay />
      <MomentComposer />

      {isLoading && <Loading />}
      {error && (
        <p className="text-rose-600">
          加载失败:{(error as Error).message}
        </p>
      )}

      {data && data.results.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          还没有人发动态。
        </div>
      )}

      {data?.results.map((m) => (
        <MomentCard key={m.id} moment={m} />
      ))}
    </div>
  )
}