import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateStory } from '@/hooks/useStories'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function StoryForm() {
  const navigate = useNavigate()
  const create = useCreateStory()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(todayStr())
  const [summary, setSummary] = useState('')
  const [visibility, setVisibility] = useState<'family' | 'private'>('family')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    create.mutate(
      { title: title.trim(), date, summary, visibility },
      { onSuccess: (story) => navigate(`/stories/${story.id}`) },
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">写一个故事</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">标题 *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="如：2024 年的第一场雪"
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">日期 *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">简介（可选）</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="一句话描述这个故事"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">可见范围</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'family' | 'private')}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none"
          >
            <option value="family">家人可见</option>
            <option value="private">仅自己</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={create.isPending}
            className="px-5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-60"
          >
            {create.isPending ? '创建中…' : '创建并开始写'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/stories')}
            className="px-5 py-2 border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
