import { useState, type FormEvent } from 'react'
import { useAlbums, useMedia, useCreateAlbum } from '@/hooks/usePhotos'
import MediaGrid from '@/components/MediaGrid'
import PhotoUploader from '@/components/PhotoUploader'
import AlbumCard from '@/components/AlbumCard'

type Tab = 'timeline' | 'albums'

export default function Photos() {
  const [tab, setTab] = useState<Tab>('timeline')
  const [creating, setCreating] = useState(false)
  const [albumName, setAlbumName] = useState('')

  const { data: mediaData, isLoading: mediaLoading } = useMedia()
  const { data: albumsData, isLoading: albumsLoading } = useAlbums()
  const createAlbum = useCreateAlbum()

  const submitAlbum = async (e: FormEvent) => {
    e.preventDefault()
    if (!albumName.trim()) return
    await createAlbum.mutateAsync({ name: albumName.trim() })
    setAlbumName('')
    setCreating(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTab('timeline')}
            className={`text-base font-semibold transition-colors ${
              tab === 'timeline' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            时间线
          </button>
          <button
            type="button"
            onClick={() => setTab('albums')}
            className={`text-base font-semibold transition-colors ${
              tab === 'albums' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            相册
          </button>
        </div>
        <div className="flex gap-2">
          {tab === 'albums' && (
            <button
              type="button"
              onClick={() => setCreating((v) => !v)}
              className="px-4 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50"
            >
              新建相册
            </button>
          )}
          <PhotoUploader />
        </div>
      </div>

      {creating && (
        <form
          onSubmit={submitAlbum}
          className="flex gap-2 bg-white rounded-xl p-4"
        >
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="相册名,比如 2026 旅行"
            autoFocus
            required
            maxLength={100}
            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={createAlbum.isPending}
            className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            创建
          </button>
        </form>
      )}

      {tab === 'timeline' && (
        <>
          {mediaLoading && <p className="text-slate-500">加载中...</p>}
          {mediaData && (
            <MediaGrid items={mediaData.results} groupByMonth />
          )}
        </>
      )}

      {tab === 'albums' && (
        <>
          {albumsLoading && <p className="text-slate-500">加载中...</p>}
          {albumsData && albumsData.results.length === 0 && (
            <p className="text-center text-slate-500 py-16">
              还没有相册,点上方"新建相册"开始。
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {albumsData?.results.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
