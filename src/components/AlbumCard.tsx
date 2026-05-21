import { Link } from 'react-router-dom'
import type { Album } from '@/lib/types'

interface Props {
  album: Album
}

export default function AlbumCard({ album }: Props) {
  return (
    <Link
      to={`/photos/albums/${album.id}`}
      className="block group"
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-slate-200 mb-2">
        {album.cover_thumbnail ? (
          <img
            src={album.cover_thumbnail}
            alt={album.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            空相册
          </div>
        )}
      </div>
      <div className="text-sm font-medium text-slate-900 truncate">{album.name}</div>
      <div className="text-xs text-slate-400">{album.photo_count} 张</div>
    </Link>
  )
}
