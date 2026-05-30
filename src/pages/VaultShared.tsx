import { useRef, useState, useCallback, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useFolder,
  useFolders,
  useFiles,
  useCreateFolder,
  useUploadFiles,
  useDeleteFolder,
} from '@/hooks/useVault'
import { useMe } from '@/hooks/useAuth'
import VaultBreadcrumb from '@/components/VaultBreadcrumb'
import FolderCard from '@/components/FolderCard'
import FileRow from '@/components/FileRow'
import FilePreview from '@/components/FilePreview'
import type { VaultFile } from '@/lib/types'
import { FolderPlus, Upload, Search, SlidersHorizontal, Users, Trash2, HardDrive } from 'lucide-react'

export default function VaultShared() {
  const { id } = useParams<{ id: string }>()
  const folderId = id ? Number(id) : null

  const { data: me } = useMe()

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [importantOnUpload, setImportantOnUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<VaultFile | null>(null)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('')
  const [dragging, setDragging] = useState(false)

  const { data: folder } = useFolder(folderId ?? undefined)
  const { data: folders } = useFolders(folderId, true)
  const { data: files } = useFiles(folderId, { q: q || undefined, sort: sort || undefined, shared: true })

  const createFolder = useCreateFolder()
  const upload = useUploadFiles()
  const deleteFolder = useDeleteFolder()

  const submitNewFolder = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await createFolder.mutateAsync({
      name: newName.trim(),
      parent: folderId,
      visibility: 'family',
    })
    setNewName('')
    setCreating(false)
  }

  const doUpload = useCallback(async (list: File[]) => {
    if (list.length === 0) return
    await upload.mutateAsync({ files: list, folderId, isImportant: importantOnUpload, visibility: 'family' })
    if (fileRef.current) fileRef.current.value = ''
    setImportantOnUpload(false)
  }, [folderId, importantOnUpload, upload])

  const onSelectFiles = (e: ChangeEvent<HTMLInputElement>) => {
    doUpload(Array.from(e.target.files ?? []))
  }

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e: DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    doUpload(Array.from(e.dataTransfer.files))
  }

  const ancestors = folder?.ancestors ?? []
  const isOwner = me && folder && me.id === folder.owner.id
  const isEmpty = !folders?.length && !files?.length

  return (
    <div
      className="space-y-5 relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {dragging && (
        <div className="fixed inset-0 z-40 bg-sky-500/10 border-4 border-dashed border-sky-400 rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-3">
            <Upload className="w-10 h-10 text-sky-500" />
            <p className="text-lg font-semibold text-slate-700">松开即可上传到共享空间</p>
          </div>
        </div>
      )}

      <VaultBreadcrumb ancestors={ancestors} current={folder?.name} shared />

      {folder ? (
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{folder.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>{folder.owner.username}</span>
              <span>·</span>
              <span>{folder.item_count} 项</span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-sky-50 rounded-md text-sky-500">
                <Users className="w-3 h-3" />家庭共享
              </span>
            </div>
          </div>
          {isOwner && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`删除文件夹"${folder.name}"?里面所有内容会一起删除。`)) {
                  deleteFolder.mutate(folder.id)
                  history.back()
                }
              }}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除文件夹
            </button>
          )}
        </header>
      ) : (
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">家庭共享空间</h1>
              <p className="text-xs text-slate-400 mt-0.5">所有家人标记为"家庭共享"的内容</p>
            </div>
          </div>
          <Link
            to="/vault"
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
          >
            <HardDrive className="w-4 h-4" />
            我的文件柜
          </Link>
        </header>
      )}

      {/* 搜索 + 排序 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="搜索共享文件名…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-300 bg-white"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 bg-white focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">默认排序</option>
            <option value="name">按名称</option>
            <option value="size">按大小</option>
            <option value="date">按时间</option>
          </select>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-xl border transition-colors ${
            creating
              ? 'border-slate-300 bg-slate-100 text-slate-600'
              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          {creating ? '取消' : '新建共享文件夹'}
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
          <input
            type="checkbox"
            checked={importantOnUpload}
            onChange={(e) => setImportantOnUpload(e.target.checked)}
            className="rounded accent-amber-500"
          />
          标为重要
        </label>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-500 disabled:opacity-50 transition-colors ml-auto"
        >
          <Upload className="w-4 h-4" />
          {upload.isPending ? '上传中…' : '上传到共享'}
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={onSelectFiles} />
      </div>

      {/* 新建文件夹表单 */}
      {creating && (
        <form
          onSubmit={submitNewFolder}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="文件夹名，比如 全家照片 / 共同证件 / 家庭账单"
            required
            autoFocus
            maxLength={100}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-300"
          />
          <p className="text-xs text-slate-400">共享空间内的文件夹默认对所有家人可见</p>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createFolder.isPending}
              className="px-5 py-2 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-500 disabled:opacity-50 transition-colors"
            >
              创建
            </button>
          </div>
        </form>
      )}

      {/* 文件夹列表 */}
      {folders && folders.length > 0 && !q && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">共享文件夹</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((f) => (
              <FolderCard
                key={f.id}
                folder={f}
                canDelete={me?.id === f.owner.id}
                onDelete={(fid) => deleteFolder.mutate(fid)}
                shared
              />
            ))}
          </div>
        </section>
      )}

      {/* 文件列表 */}
      {files && files.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">共享文件</h2>
          <div className="space-y-2">
            {files.map((f) => (
              <FileRow key={f.id} file={f} onPreview={setPreview} />
            ))}
          </div>
        </section>
      )}

      {/* 空状态 */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
            <Users className="w-8 h-8 text-sky-400" />
          </div>
          <div>
            <p className="font-medium text-slate-500">共享空间还是空的</p>
            <p className="text-sm text-slate-400 mt-1">上传文件或在自己的文件柜中将文件设为"家庭共享"</p>
          </div>
        </div>
      )}

      {preview && (
        <FilePreview file={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}
