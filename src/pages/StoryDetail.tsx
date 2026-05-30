import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  useStory,
  useAddTextBlock,
  useAddImmichBlock,
  useAddPhotoBlock,
  useDeleteBlock,
  useUpdateBlock,
} from '@/hooks/useStories'
import { useMe } from '@/hooks/useAuth'
import ImmichPicker from '@/components/ImmichPicker'
import type { ImmichAsset, StoryBlock } from '@/lib/types'
import { Trash2 } from 'lucide-react'

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>()
  const storyId = Number(id)
  const { data: story, isLoading } = useStory(storyId)
  const { data: me } = useMe()
  const isAuthor = !!me && !!story && me.id === story.author.id

  const addText = useAddTextBlock(storyId)
  const addImmich = useAddImmichBlock(storyId)
  const addPhoto = useAddPhotoBlock(storyId)
  const delBlock = useDeleteBlock(storyId)
  const updateBlock = useUpdateBlock(storyId)

  const [immichOpen, setImmichOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  if (isLoading) return <p className="text-slate-400 text-sm text-center py-10">加载中…</p>
  if (!story) return <p className="text-slate-400 text-sm text-center py-10">故事不存在</p>

  function startEdit(block: StoryBlock) {
    setEditingId(block.id)
    setEditText(block.kind === 'text' ? block.text : block.caption)
  }

  function saveEdit(block: StoryBlock) {
    if (block.kind === 'text') {
      updateBlock.mutate({ blockId: block.id, text: editText })
    } else {
      updateBlock.mutate({ blockId: block.id, caption: editText })
    }
    setEditingId(null)
  }

  function onImmichConfirm(assets: ImmichAsset[]) {
    assets.forEach((a) => {
      addImmich.mutate({
        immich_asset_id: a.id,
        immich_filename: a.original_file_name,
      })
    })
  }

  function onPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) addPhoto.mutate({ file })
    e.target.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 返回 */}
      <Link to="/stories" className="text-sm text-slate-400 hover:text-slate-700">← 所有故事</Link>

      {/* 封面 + 标题 */}
      <div className="space-y-3">
        {story.cover_url && (
          <img src={story.cover_url} alt="" className="w-full h-56 object-cover rounded-xl" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{story.title}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {story.date} · {story.author.display_name}
          </p>
          {story.summary && (
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">{story.summary}</p>
          )}
        </div>
      </div>

      {/* 内容块列表 */}
      <div className="space-y-5">
        {story.blocks.map((block) => (
          <BlockView
            key={block.id}
            block={block}
            isAuthor={isAuthor}
            editing={editingId === block.id}
            editText={editText}
            onEditTextChange={setEditText}
            onStartEdit={() => startEdit(block)}
            onSaveEdit={() => saveEdit(block)}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() => delBlock.mutate(block.id)}
          />
        ))}

        {story.blocks.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
            还没有内容，从下面添加文字或图片吧
          </div>
        )}
      </div>

      {/* 编辑工具栏（仅作者可见） */}
      {isAuthor && (
        <AddBlockToolbar
          onAddText={() => addText.mutate({ text: '在这里写点什么…' })}
          onAddImmich={() => setImmichOpen(true)}
          onAddPhoto={() => fileRef.current?.click()}
          loading={addText.isPending || addImmich.isPending || addPhoto.isPending}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPhotoFile}
      />

      <ImmichPicker
        open={immichOpen}
        onClose={() => setImmichOpen(false)}
        onConfirm={onImmichConfirm}
        maxSelect={9}
      />
    </div>
  )
}

function BlockView({
  block,
  isAuthor,
  editing,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  block: StoryBlock
  isAuthor: boolean
  editing: boolean
  editText: string
  onEditTextChange: (v: string) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="group relative">
      {block.kind === 'text' && (
        editing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              rows={4}
              autoFocus
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onSaveEdit} className="px-3 py-1 text-xs bg-slate-900 text-white rounded hover:bg-slate-700">保存</button>
              <button type="button" onClick={onCancelEdit} className="px-3 py-1 text-xs border border-slate-200 text-slate-600 rounded hover:bg-slate-50">取消</button>
            </div>
          </div>
        ) : (
          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{block.text}</p>
        )
      )}

      {(block.kind === 'photo' || block.kind === 'immich') && (
        <div className="space-y-1">
          <img
            src={block.kind === 'photo' ? (block.image_url ?? '') : (block.immich_preview_url ?? block.immich_thumbnail_url ?? '')}
            alt={block.caption}
            className="w-full rounded-xl object-cover max-h-[480px]"
          />
          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                placeholder="图片说明（可选）"
                autoFocus
                className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none"
              />
              <button type="button" onClick={onSaveEdit} className="px-3 py-1 text-xs bg-slate-900 text-white rounded">保存</button>
              <button type="button" onClick={onCancelEdit} className="px-3 py-1 text-xs border border-slate-200 rounded">取消</button>
            </div>
          ) : (
            block.caption && <p className="text-xs text-slate-400 text-center">{block.caption}</p>
          )}
        </div>
      )}

      {/* 作者操作按钮（hover 显示） */}
      {isAuthor && !editing && (
        <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-1 bg-white/90 rounded-md px-1 py-0.5 shadow-sm border border-slate-100">
          <button type="button" onClick={onStartEdit} className="text-xs text-slate-500 hover:text-slate-900 px-1">编辑</button>
          <button type="button" onClick={onDelete} className="text-xs text-red-400 hover:text-red-600 px-1"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </div>
  )
}

function AddBlockToolbar({
  onAddText,
  onAddImmich,
  onAddPhoto,
  loading,
}: {
  onAddText: () => void
  onAddImmich: () => void
  onAddPhoto: () => void
  loading: boolean
}) {
  return (
    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
      <span className="text-xs text-slate-400 mr-1">添加：</span>
      <button
        type="button"
        onClick={onAddText}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
      >
        ✍️ 文字
      </button>
      <button
        type="button"
        onClick={onAddImmich}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
      >
        🖼️ 从 Immich 选图
      </button>
      <button
        type="button"
        onClick={onAddPhoto}
        disabled={loading}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
      >
        📷 上传图片
      </button>
    </div>
  )
}