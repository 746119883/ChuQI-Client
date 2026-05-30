import { useRef, useState, type ChangeEvent } from 'react'
import { useCreateMoment } from '@/hooks/useMoments'
import { useImmichStatus } from '@/hooks/useImmich'
import type { ImmichAsset, Visibility } from '@/lib/types'
import ImmichPicker from './ImmichPicker'

const MAX_TOTAL = 9

export default function MomentComposer() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [immichSelected, setImmichSelected] = useState<ImmichAsset[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>('family')
  const fileRef = useRef<HTMLInputElement>(null)
  const create = useCreateMoment()
  const { data: immichStatus } = useImmichStatus()

  const totalCount = images.length + immichSelected.length
  const remaining = Math.max(0, MAX_TOTAL - totalCount)

  const onSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const newImages = [...images, ...files].slice(0, MAX_TOTAL - immichSelected.length)
    setImages(newImages)
    setPreviews(newImages.map((f) => URL.createObjectURL(f)))
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (i: number) => {
    const next = images.filter((_, idx) => idx !== i)
    setImages(next)
    setPreviews(next.map((f) => URL.createObjectURL(f)))
  }

  const removeImmich = (id: string) => {
    setImmichSelected((prev) => prev.filter((a) => a.id !== id))
  }

  const onImmichConfirm = (assets: ImmichAsset[]) => {
    const cap = MAX_TOTAL - images.length
    setImmichSelected(assets.slice(0, cap))
  }

  const submit = async () => {
    if (!content.trim() && totalCount === 0) return
    await create.mutateAsync({
      content: content.trim(),
      visibility,
      images,
      immichAssetIds: immichSelected.map((a) => a.id),
    })
    setContent('')
    setImages([])
    setPreviews([])
    setImmichSelected([])
  }

  const disabled = (!content.trim() && totalCount === 0) || create.isPending

  return (
    <div className="bg-white rounded-xl p-5 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="此刻在想什么..."
        rows={3}
        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
      />

      {(previews.length > 0 || immichSelected.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((url, i) => (
            <div key={`local-${i}`} className="relative group aspect-square">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {immichSelected.map((a) => (
            <div key={a.id} className="relative group aspect-square">
              <img
                src={a.thumbnail_url}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              <span className="absolute bottom-1 left-1 text-[10px] px-1 bg-black/50 text-white rounded">
                Immich
              </span>
              <button
                type="button"
                onClick={() => removeImmich(a.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={remaining === 0}
            className="text-slate-600 hover:text-slate-900 disabled:opacity-40"
          >
            📷 上传
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onSelectFiles}
          />
          {immichStatus?.enabled && (
            <>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                disabled={remaining === 0}
                className="text-slate-600 hover:text-slate-900 disabled:opacity-40"
              >
                🖼 从 Immich 选
              </button>
            </>
          )}
          <span className="text-slate-300">·</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="text-slate-600 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="family">家人可见</option>
            <option value="private">仅自己</option>
          </select>
          {totalCount > 0 && (
            <span className="text-xs text-slate-400">
              {totalCount}/{MAX_TOTAL}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="px-5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
        >
          {create.isPending ? '发布中...' : '发布'}
        </button>
      </div>

      {create.isError && (
        <p className="text-sm text-rose-600">发布失败</p>
      )}

      <ImmichPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={onImmichConfirm}
        maxSelect={MAX_TOTAL - images.length}
        initialSelected={immichSelected}
      />
    </div>
  )
}
