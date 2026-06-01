import {
  useHealthAttachments,
  useUploadHealthAttachment,
  useDeleteHealthAttachment,
} from '@/hooks/useHealthAttachments'

/**
 * 健康附件区块：列表 + 上传 + 预览 + 删除。
 * params 指定挂载对象，如 { checkup_result: 5 }。
 */
export default function HealthAttachments({
  params,
  accept = 'image/jpeg,image/png,application/pdf',
  multiple = false,
}: {
  params: Record<string, number>
  accept?: string
  multiple?: boolean
}) {
  const { data: list = [] } = useHealthAttachments(params)
  const upload = useUploadHealthAttachment(params)
  const del = useDeleteHealthAttachment(params)

  const onPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync(file)
      } catch (e: unknown) {
        const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        window.alert(detail ?? '上传失败')
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">附件</h2>
        <label className="text-sm text-blue-600 cursor-pointer hover:underline">
          {upload.isPending ? '上传中...' : '+ 上传附件'}
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
          />
        </label>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-slate-400">暂无附件（支持 JPEG/PNG/PDF，单文件 ≤20MB）</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {list.map((a) => (
            <div key={a.id} className="relative group border border-slate-100 rounded-lg overflow-hidden">
              {a.is_image && a.file_url ? (
                <a href={a.file_url} target="_blank" rel="noreferrer">
                  <img src={a.file_url} alt={a.name} className="w-full h-28 object-cover" />
                </a>
              ) : (
                <a
                  href={a.file_url ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center h-28 bg-slate-50 text-slate-500"
                >
                  <span className="text-3xl">📄</span>
                  <span className="text-xs mt-1 px-2 truncate max-w-full">{a.name}</span>
                </a>
              )}
              <button
                onClick={() => {
                  if (window.confirm('删除该附件？')) del.mutate(a.id)
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
