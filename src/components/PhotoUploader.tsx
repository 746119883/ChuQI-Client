import { useRef, type ChangeEvent } from 'react'
import { useUploadPhotos } from '@/hooks/usePhotos'

interface Props {
  albumId?: number | null
  label?: string
}

export default function PhotoUploader({ albumId = null, label = '上传照片/视频' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPhotos()

  const onSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    await upload.mutateAsync({ files, albumId })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={upload.isPending}
        className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
      >
        {upload.isPending ? '上传中...' : label}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,image/heic,image/heif,video/*"
        multiple
        className="hidden"
        onChange={onSelect}
      />
      {upload.data?.errors && upload.data.errors.length > 0 && (
        <p className="text-xs text-rose-600 mt-2">
          {upload.data.errors.length} 张失败:
          {upload.data.errors.map((e) => e.name).join(', ')}
        </p>
      )}
    </>
  )
}
