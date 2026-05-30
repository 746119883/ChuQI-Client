import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '@/hooks/useRecipes'
import { CATEGORIES, DIFFICULTY_LABEL } from '@/lib/recipeMeta'
import type { RecipeCategory } from '@/lib/types'

export default function Recipes() {
  const [category, setCategory] = useState<RecipeCategory | ''>('')
  const [q, setQ] = useState('')
  const { data, isLoading } = useRecipes({ category, q })
  const recipes = data?.results ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">家庭菜谱</h1>
        <Link
          to="/recipes/new"
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          + 新菜谱
        </Link>
      </div>

      <div className="space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜菜名..."
          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`px-3 py-1 rounded-full border ${
              category === '' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(category === c.value ? '' : c.value)}
              className={`px-3 py-1 rounded-full border ${
                category === c.value ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-slate-500">加载中...</p>}
      {!isLoading && recipes.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          还没有菜谱，点右上「+ 新菜谱」把拿手菜记下来吧。
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {recipes.map((r) => (
          <Link
            key={r.id}
            to={`/recipes/${r.id}`}
            className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
          >
            <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
              {r.cover_url ? (
                <img
                  src={r.cover_url}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🍳</div>
              )}
            </div>
            <div className="p-3">
              <div className="font-medium text-slate-900 truncate">{r.title}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{r.category_display}</span>
                <span>·</span>
                <span>{DIFFICULTY_LABEL[r.difficulty]}</span>
                {r.total_time_min ? (
                  <>
                    <span>·</span>
                    <span>{r.total_time_min} 分钟</span>
                  </>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
