import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useDeleteRecipe,
  useRecipe,
  useRecipeToShoppingList,
} from '@/hooks/useRecipes'
import { useMe } from '@/hooks/useAuth'
import { CATEGORY_LABEL, DIFFICULTY_LABEL } from '@/lib/recipeMeta'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const recipeId = Number(id)
  const navigate = useNavigate()
  const { data: recipe, isLoading } = useRecipe(recipeId)
  const { data: me } = useMe()
  const del = useDeleteRecipe()
  const toList = useRecipeToShoppingList(recipeId)
  const [toast, setToast] = useState<string | null>(null)

  if (isLoading) return <p className="text-slate-500">加载中...</p>
  if (!recipe) return <p className="text-slate-500">菜谱不存在</p>

  const isAuthor = me?.id === recipe.author.id

  const addToShopping = async () => {
    const res = await toList.mutateAsync(undefined)
    setToast(`已添加 ${res.added} 样食材到「${res.list_name}」`)
    setTimeout(() => setToast(null), 4000)
  }

  const onDelete = () => {
    if (!confirm(`删除「${recipe.title}」?`)) return
    del.mutate(recipe.id, { onSuccess: () => navigate('/recipes', { replace: true }) })
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link to="/recipes" className="text-sm text-slate-500 hover:text-slate-900">
        ← 菜谱
      </Link>

      {recipe.cover_url && (
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[16/9]">
          <img src={recipe.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{recipe.title}</h1>
          {isAuthor && (
            <div className="flex items-center gap-3 text-sm shrink-0 pt-1">
              <Link to={`/recipes/${recipe.id}/edit`} className="text-slate-500 hover:text-slate-900">
                编辑
              </Link>
              <button type="button" onClick={onDelete} className="text-slate-400 hover:text-rose-600">
                删除
              </button>
            </div>
          )}
        </div>
        <div className="text-sm text-slate-400 mt-2 flex items-center gap-2 flex-wrap">
          <span>{CATEGORY_LABEL[recipe.category]}</span>
          <span>·</span>
          <span>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
          {recipe.total_time_min ? (
            <>
              <span>·</span>
              <span>{recipe.total_time_min} 分钟</span>
            </>
          ) : null}
          {recipe.servings && (
            <>
              <span>·</span>
              <span>{recipe.servings}</span>
            </>
          )}
          <span>·</span>
          <span>{recipe.author.display_name || recipe.author.username}</span>
        </div>
        {recipe.tags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2">
            {recipe.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {recipe.description && (
        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{recipe.description}</p>
      )}

      {/* 食材 */}
      <section className="bg-white rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">食材</h2>
          {recipe.ingredients.length > 0 && (
            <button
              type="button"
              onClick={addToShopping}
              disabled={toList.isPending}
              className="text-sm px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {toList.isPending ? '添加中...' : '🛒 加入购物清单'}
            </button>
          )}
        </div>
        {recipe.ingredients.length === 0 ? (
          <p className="text-sm text-slate-400">未填写食材</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-800">{ing.name}</span>
                <span className="text-slate-500">{ing.amount}</span>
              </li>
            ))}
          </ul>
        )}
        {toast && <p className="text-sm text-emerald-600 mt-3">{toast}</p>}
      </section>

      {/* 步骤 */}
      <section className="bg-white rounded-xl p-5">
        <h2 className="font-semibold text-slate-900 mb-3">做法</h2>
        {recipe.steps.length === 0 ? (
          <p className="text-sm text-slate-400">未填写步骤</p>
        ) : (
          <ol className="space-y-4">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{s.text}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
