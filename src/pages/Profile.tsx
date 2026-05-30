import { useEffect, useState, type FormEvent } from 'react'
import { useMe, useUpdateProfile } from '@/hooks/useAuth'
import { Loading } from '@/components/StateView'

export default function Profile() {
  const { data: me, isLoading } = useMe()
  const update = useUpdateProfile()

  const [nickname, setNickname] = useState('')
  const [relation, setRelation] = useState('')
  const [birthday, setBirthday] = useState('')
  const [birthdayIsLunar, setBirthdayIsLunar] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    if (me?.profile) {
      setNickname(me.profile.nickname ?? '')
      setRelation(me.profile.relation ?? '')
      setBirthday(me.profile.birthday ?? '')
      setBirthdayIsLunar(me.profile.birthday_is_lunar ?? false)
    }
  }, [me])

  if (isLoading) return <Loading />
  if (!me) return null

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const form = new FormData()
    form.append('nickname', nickname)
    form.append('relation', relation)
    if (birthday) form.append('birthday', birthday)
    else form.append('birthday', '')
    form.append('birthday_is_lunar', String(birthdayIsLunar))
    if (avatarFile) form.append('avatar', avatarFile)
    try {
      await update.mutateAsync(form)
      setAvatarFile(null)
      setSavedAt(Date.now())
    } catch {
      /* 错误下方 */
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">个人资料</h1>

      <form onSubmit={onSubmit} className="space-y-5 bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 text-xl">
            {me.avatar_url ? (
              <img src={me.avatar_url} alt="头像" className="w-full h-full object-cover" />
            ) : (
              me.display_name.slice(0, 1)
            )}
          </div>
          <label className="text-sm">
            <span className="block text-slate-700 mb-1">更换头像</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              className="text-xs"
            />
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">用户名</label>
          <input
            value={me.username}
            disabled
            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">昵称</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">家庭关系</label>
          <input
            type="text"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            maxLength={20}
            placeholder="爸 / 妈 / 哥 / 我"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">生日</label>
          <input
            type="date"
            value={birthday ?? ''}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <label className="inline-flex items-center gap-2 mt-1 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={birthdayIsLunar}
              onChange={(e) => setBirthdayIsLunar(e.target.checked)}
            />
            农历
          </label>
        </div>

        <div className="text-sm text-slate-500">
          角色: <span className="font-medium text-slate-700">
            {me.profile?.role === 'admin' ? '家长' : me.profile?.role === 'elder' ? '老人' : '成员'}
          </span>
        </div>

        {update.isError && (
          <p className="text-sm text-rose-600">保存失败</p>
        )}
        {savedAt && !update.isPending && !update.isError && (
          <p className="text-sm text-emerald-600">已保存</p>
        )}

        <button
          type="submit"
          disabled={update.isPending}
          className="w-full py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
        >
          {update.isPending ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  )
}