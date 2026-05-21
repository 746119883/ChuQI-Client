import { useRef, useState, type ChangeEvent } from 'react'
import { useCreateMoment } from '@/hooks/useMoments'
import type { Visibility } from '@/lib/types'

export default function MomentComposer() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [visibility, setVisibility] = useState<Visibility>('family')
  const fileRef = useRef<HTMLInputElement>(null)
  const create = useCreateMoment()

  const onSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const newImages = [...images, ...files].slice(0, 9)
    setImages(newImages)
    setPreviews(newImages.map((f) => URL.createObjectURL(f)))
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (i: number) => {
    const next = images.filter((_, idx) => idx !== i)
    setImages(next)
    setPreviews(next.map((f) => URL.createObjectURL(f)))
  }

  const submit = async () => {
    if (!content.trim() && images.length === 0) return
    await create.mutateAsync({ content: content.trim(), visibility, images })
    setContent('')
    setImages([])
    setPreviews([])
  }

  const disabled = (!content.trim() && images.length === 0) || create.isPending

  return (
    <div className="bg-white rounded-xl p-5 space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="此刻在想什么..."
        rows={3}
        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
            className="text-slate-600 hover:text-slate-900"
          >
            📷 图片
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onSelectFiles}
          />
          <span className="text-slate-300">·</span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
            className="text-slate-600 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="family">家人可见</option>
            <option value="private">仅自己</option>
          </select>
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
    </div>
  )
}
