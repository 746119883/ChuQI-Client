import { useEffect, useState } from 'react'
import { useImmichAlbum, useImmichAlbums } from '@/hooks/useImmich'
import type { ImmichAsset } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (assets: ImmichAsset[]) => void
  maxSelect?: number
  initialSelected?: ImmichAsset[]
}

export default function ImmichPicker({
  open,
  onClose,
  onConfirm,
  maxSelect = 9,
  initialSelected = [],
}: Props) {
  const [albumId, setAlbumId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Map<string, ImmichAsset>>(new Map())

  // 每次打开：回到相册列表，并带入已选
  useEffect(() => {
    if (open) {
      setAlbumId(null)
      setSelected(new Map(initialSelected.map((a) => [a.id, a])))
    }
    // initialSelected 只在 open 变 true 时读取一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const albums = useImmichAlbums(open)
  const album = useImmichAlbum(open ? albumId : null)

  if (!open) return null

  const toggle = (a: ImmichAsset) => {
    const next = new Map(selected)
    if (next.has(a.id)) next.delete(a.id)
    else {
      if (next.size >= maxSelect) return
      next.set(a.id, a)
    }
    setSelected(next)
  }

  const confirm = () => {
    onConfirm(Array.from(selected.values()))
    onClose()
  }

  const inAlbum = albumId !== null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-2xl h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden">
        <header className="px-4 h-12 flex items-center justify-between border-b border-slate-200 shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {inAlbum && (
              <button
                type="button"
                onClick={() => setAlbumId(null)}
                className="text-slate-500 hover:text-slate-900 text-sm shrink-0"
              >
                ← 相册
              </button>
            )}
            <span className="font-medium text-slate-900 truncate">
              {inAlbum ? album.data?.name ?? '加载中' : '从 Immich 共享相册选图'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm shrink-0">
            <span className="text-slate-500 hidden sm:inline">
              已选 {selected.size}/{maxSelect}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900"
            >
              取消
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={confirm}
              className="px-3 py-1 bg-slate-900 text-white rounded hover:bg-slate-700 disabled:opacity-40"
            >
              确定{selected.size > 0 && ` (${selected.size})`}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {/* 第一级：相册列表 */}
          {!inAlbum && (
            <>
              {albums.isLoading && (
                <div className="text-center text-slate-500 py-8">加载中...</div>
              )}
              {albums.isError && (
                <div className="text-center text-rose-600 py-8">
                  加载失败，检查 Immich 是否在跑
                </div>
              )}
              {!albums.isLoading && (albums.data?.items.length ?? 0) === 0 && (
                <div className="text-center text-slate-500 py-12 px-6 leading-relaxed">
                  还没有共享相册。
                  <br />
                  去 Immich 把要给家人看的相册设为「共享」
                  <br />
                  （分享给家人账号，或创建共享链接）即可在这里出现。
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {albums.data?.items.map((al) => (
                  <button
                    type="button"
                    key={al.id}
                    onClick={() => setAlbumId(al.id)}
                    className="text-left group"
                  >
                    <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                      {al.thumbnail_url ? (
                        <img
                          src={al.thumbnail_url}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">
                          🖼
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 px-0.5">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {al.name}
                      </div>
                      <div className="text-xs text-slate-400">{al.asset_count} 张</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* 第二级：相册内图片 */}
          {inAlbum && (
            <>
              {album.isLoading && (
                <div className="text-center text-slate-500 py-8">加载中...</div>
              )}
              {album.isError && (
                <div className="text-center text-rose-600 py-8">加载失败</div>
              )}
              {!album.isLoading && (album.data?.items.length ?? 0) === 0 && (
                <div className="text-center text-slate-500 py-8">这个相册没有图片</div>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1">
                {album.data?.items.map((a) => {
                  const isSelected = selected.has(a.id)
                  const idx = isSelected
                    ? Array.from(selected.keys()).indexOf(a.id) + 1
                    : 0
                  return (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => toggle(a)}
                      className="relative aspect-square overflow-hidden rounded-md bg-slate-100"
                    >
                      <img
                        src={a.thumbnail_url}
                        alt={a.original_file_name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute inset-0 bg-slate-900/30 ring-2 ring-slate-900 rounded-md flex items-start justify-end p-1">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                            {idx}
                          </span>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
