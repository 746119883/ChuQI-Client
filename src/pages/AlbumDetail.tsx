import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAlbum, useMedia, useDeleteAlbum } from '@/hooks/usePhotos'
import { useMe } from '@/hooks/useAuth'
import MediaGrid from '@/components/MediaGrid'
import PhotoUploader from '@/components/PhotoUploader'

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>()
  const albumId = id ? Number(id) : undefined
  const navigate = useNavigate()

  const { data: album, isLoading: albumLoading, error } = useAlbum(albumId)
  const { data: mediaData, isLoading: mediaLoading } = useMedia(albumId)
  const { data: me } = useMe()
  const del = useDeleteAlbum()

  if (albumLoading) return <p className="text-slate-500">加载中...</p>
  if (error || !album) return <p className="text-rose-600">相册不存在</p>

  const isOwner = me?.id === album.owner.id

  const onDelete = async () => {
    if (!confirm(`删除相册"${album.name}"?照片不会被删除,只会移出相册。`)) return
    await del.mutateAsync(album.id)
    navigate('/photos', { replace: true })
  }

  return (
    <div className="space-y-5">
      <Link to="/photos" className="text-sm text-blue-600 hover:underline">
        ← 返回相册列表
      </Link>

      <header className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{album.name}</h1>
          {album.description && (
            <p className="text-sm text-slate-500 mt-1">{album.description}</p>
          )}
          <div className="text-xs text-slate-400 mt-1">
            {album.owner.username} · {album.photo_count} 张照片
            {album.video_count > 0 && <> · {album.video_count} 个视频</>}
          </div>
        </div>
        <div className="flex gap-2">
          <PhotoUploader albumId={album.id} label="上传到此相册" />
          {isOwner && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md"
            >
              删除相册
            </button>
          )}
        </div>
      </header>

      {mediaLoading && <p className="text-slate-500">加载中...</p>}
      {mediaData && <MediaGrid items={mediaData.results} />}
    </div>
  )
}
