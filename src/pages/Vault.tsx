import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
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
import type { VaultFile, Visibility } from '@/lib/types'

export default function Vault() {
  const { id } = useParams<{ id: string }>()
  const folderId = id ? Number(id) : null

  const { data: me } = useMe()
  const { data: folder } = useFolder(folderId ?? undefined)
  const { data: folders } = useFolders(folderId)
  const { data: files } = useFiles(folderId)

  const createFolder = useCreateFolder()
  const upload = useUploadFiles()
  const deleteFolder = useDeleteFolder()

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIsShared, setNewIsShared] = useState(true)

  const [importantOnUpload, setImportantOnUpload] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<VaultFile | null>(null)

  const submitNewFolder = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await createFolder.mutateAsync({
      name: newName.trim(),
      parent: folderId,
      visibility: newIsShared ? 'family' : 'private',
    })
    setNewName('')
    setCreating(false)
  }

  const onSelectFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? [])
    if (list.length === 0) return
    const visibility: Visibility = folder?.visibility ?? 'family'
    await upload.mutateAsync({
      files: list,
      folderId,
      isImportant: importantOnUpload,
      visibility,
    })
    if (fileRef.current) fileRef.current.value = ''
    setImportantOnUpload(false)
  }

  const onDeleteFolder = (fid: number) => deleteFolder.mutate(fid)

  const ancestors = folder?.ancestors ?? []
  const isOwner = me && folder && me.id === folder.owner.id

  return (
    <div className="space-y-5">
      <VaultBreadcrumb ancestors={ancestors} current={folder?.name} />

      {folder && (
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{folder.name}</h1>
            <div className="text-xs text-slate-400 mt-1">
              {folder.owner.username} · {folder.item_count} 项
              {folder.visibility === 'private' && (
                <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded">私密</span>
              )}
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
              className="text-sm text-slate-400 hover:text-rose-600"
            >
              删除此文件夹
            </button>
          )}
        </header>
      )}

      {!folder && (
        <h1 className="text-2xl font-semibold text-slate-900">家庭文件柜</h1>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="px-4 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50"
        >
          {creating ? '取消' : '新建文件夹'}
        </button>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={importantOnUpload}
            onChange={(e) => setImportantOnUpload(e.target.checked)}
          />
          上传时标记为重要
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={upload.isPending}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
        >
          {upload.isPending ? '上传中...' : '上传文件'}
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={onSelectFiles}
        />
      </div>

      {creating && (
        <form
          onSubmit={submitNewFolder}
          className="bg-white rounded-xl p-4 space-y-3"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="文件夹名,比如 重要证件 / 保险单 / 房产"
            required
            autoFocus
            maxLength={100}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={newIsShared}
              onChange={(e) => setNewIsShared(e.target.checked)}
            />
            家人共享(取消勾选则仅自己可见)
          </label>
          <button
            type="submit"
            disabled={createFolder.isPending}
            className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            创建
          </button>
        </form>
      )}

      {folders && folders.length > 0 && (
        <section>
          <h2 className="text-sm text-slate-500 mb-2">文件夹</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {folders.map((f) => (
              <FolderCard
                key={f.id}
                folder={f}
                canDelete={me?.id === f.owner.id}
                onDelete={onDeleteFolder}
              />
            ))}
          </div>
        </section>
      )}

      {files && files.length > 0 && (
        <section>
          <h2 className="text-sm text-slate-500 mb-2">文件</h2>
          <div className="space-y-2">
            {files.map((f) => (
              <FileRow key={f.id} file={f} onPreview={setPreview} />
            ))}
          </div>
        </section>
      )}

      {folders?.length === 0 && files?.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          这里是空的。新建文件夹或上传文件。
        </p>
      )}

      {preview && (
        <FilePreview file={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}
