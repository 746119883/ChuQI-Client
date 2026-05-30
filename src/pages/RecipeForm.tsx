import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateRecipe,
  useRecipe,
  useUpdateRecipe,
  useUploadRecipeCover,
} from '@/hooks/useRecipes'
import { useImmichStatus } from '@/hooks/useImmich'
import { CATEGORIES, DIFFICULTIES } from '@/lib/recipeMeta'
import api from '@/lib/api'
import ImmichPicker from '@/components/ImmichPicker'
import type {
  ImmichAsset,
  Ingredient,
  RecipeCategory,
  RecipeDifficulty,
  Visibility,
} from '@/lib/types'

export default function RecipeForm() {
  const { id } = useParams<{ id: string }>()
  const editId = id ? Number(id) : undefined
  const isEdit = !!editId
  const navigate = useNavigate()

  const { data: existing } = useRecipe(editId)
  const create = useCreateRecipe()
  const update = useUpdateRecipe(editId ?? 0)
  const { data: immichStatus } = useImmichStatus()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<RecipeCategory>('other')
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('easy')
  const [servings, setServings] = useState('')
  const [totalTime, setTotalTime] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('family')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '' }])
  const [steps, setSteps] = useState<string[]>([''])

  // 封面：本地文件 或 Immich asset
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverImmich, setCoverImmich] = useState<ImmichAsset | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setDescription(existing.description)
      setCategory(existing.category)
      setDifficulty(existing.difficulty)
      setServings(existing.servings)
      setTotalTime(existing.total_time_min ? String(existing.total_time_min) : '')
      setTagsText(existing.tags.join(' '))
      setVisibility(existing.visibility)
      setIngredients(existing.ingredients.length ? existing.ingredients : [{ name: '', amount: '' }])
      setSteps(existing.steps.length ? existing.steps.map((s) => s.text) : [''])
      if (existing.cover_url && !coverPreview) setCoverPreview(existing.cover_url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing])

  const setIngredient = (i: number, patch: Partial<Ingredient>) => {
    setIngredients((prev) => prev.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)))
  }
  const addIngredient = () => setIngredients((p) => [...p, { name: '', amount: '' }])
  const removeIngredient = (i: number) =>
    setIngredients((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))

  const setStep = (i: number, text: string) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? text : s)))
  const addStep = () => setSteps((p) => [...p, ''])
  const removeStep = (i: number) =>
    setSteps((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p))

  const onPickLocalCover = (f: File | null) => {
    setCoverFile(f)
    setCoverImmich(null)
    setCoverPreview(f ? URL.createObjectURL(f) : null)
  }
  const onPickImmichCover = (assets: ImmichAsset[]) => {
    const a = assets[0]
    if (!a) return
    setCoverImmich(a)
    setCoverFile(null)
    setCoverPreview(a.thumbnail_url)
  }

  const submit = async () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      servings: servings.trim(),
      total_time_min: totalTime ? Number(totalTime) : null,
      tags: tagsText.split(/[\s,，]+/).map((t) => t.trim()).filter(Boolean),
      visibility,
      ingredients: ingredients
        .map((i) => ({ name: i.name.trim(), amount: i.amount.trim() }))
        .filter((i) => i.name),
      steps: steps.map((t) => ({ text: t.trim() })).filter((s) => s.text),
      cover_immich_asset_id: coverImmich?.id ?? (isEdit ? undefined : ''),
    }

    let recipeId = editId
    if (isEdit) {
      await update.mutateAsync(payload)
    } else {
      const created = await create.mutateAsync(payload)
      recipeId = created.id
    }

    // 本地封面单独上传
    if (coverFile && recipeId) {
      await uploadCover(recipeId, coverFile)
    }

    navigate(`/recipes/${recipeId}`, { replace: true })
  }

  // 单独封装本地封面上传（useUploadRecipeCover 需要 id，这里直接用 api）
  const uploadCoverMutation = useUploadRecipeCover(editId ?? 0)
  const uploadCover = async (rid: number, file: File) => {
    // 编辑态可直接用 hook；新建态 id 是刚创建的，用一次性请求
    if (rid === editId) {
      await uploadCoverMutation.mutateAsync(file)
    } else {
      const fd = new FormData()
      fd.append('cover', file)
      await api.post(`/recipes/${rid}/cover/`, fd, {
        headers: { 'Content-Type': undefined } as never,
      })
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">
        {isEdit ? '编辑菜谱' : '新菜谱'}
      </h1>

      <div className="bg-white rounded-xl p-5 space-y-4">
        {/* 封面 */}
        <div>
          <label className="text-sm text-slate-700 block mb-1.5">封面</label>
          <div className="flex items-center gap-4">
            <div className="w-28 h-20 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
              {coverPreview ? (
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🍳</span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-slate-600 cursor-pointer hover:text-slate-900">
                📷 上传图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickLocalCover(e.target.files?.[0] ?? null)}
                />
              </label>
              {immichStatus?.enabled && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-left text-slate-600 hover:text-slate-900"
                >
                  🖼 从 Immich 选
                </button>
              )}
            </div>
          </div>
        </div>

        <Field label="菜名">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </Field>

        <Field label="简介">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="分类">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as RecipeCategory)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="难度">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as RecipeDifficulty)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>
          <Field label="份量">
            <input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="2-3 人"
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            />
          </Field>
          <Field label="耗时(分钟)">
            <input
              type="number"
              value={totalTime}
              onChange={(e) => setTotalTime(e.target.value)}
              placeholder="15"
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            />
          </Field>
        </div>

        <Field label="标签 (空格分隔)">
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="快手 下饭"
            className="w-full px-3 py-2 border border-slate-200 rounded-md"
          />
        </Field>
      </div>

      {/* 食材 */}
      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">食材</h2>
          <button type="button" onClick={addIngredient} className="text-sm text-blue-600 hover:underline">
            + 加一行
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={ing.name}
                onChange={(e) => setIngredient(i, { name: e.target.value })}
                placeholder="食材"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <input
                value={ing.amount}
                onChange={(e) => setIngredient(i, { amount: e.target.value })}
                placeholder="用量"
                className="w-28 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="text-slate-300 hover:text-rose-600 w-6 shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 步骤 */}
      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">做法</h2>
          <button type="button" onClick={addStep} className="text-sm text-blue-600 hover:underline">
            + 加一步
          </button>
        </div>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center shrink-0 mt-2">
                {i + 1}
              </span>
              <textarea
                value={s}
                onChange={(e) => setStep(i, e.target.value)}
                rows={2}
                placeholder={`第 ${i + 1} 步`}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="text-slate-300 hover:text-rose-600 w-6 shrink-0 mt-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="text-sm text-slate-600 bg-transparent focus:outline-none"
        >
          <option value="family">家人可见</option>
          <option value="private">仅自己</option>
        </select>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim() || pending}
            className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
          >
            {pending ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <ImmichPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={onPickImmichCover}
        maxSelect={1}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-700 block">{label}</label>
      {children}
    </div>
  )
}
