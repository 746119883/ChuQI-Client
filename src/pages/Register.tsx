import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useInvitationLookup, useRegister } from '@/hooks/useAuth'

export default function Register() {
  const params = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const [code, setCode] = useState(params.code?.toUpperCase() ?? '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const lookup = useInvitationLookup(code)
  const register = useRegister()

  // 邀请码验证通过后,默认昵称预填
  useEffect(() => {
    if (lookup.data?.default_nickname && !nickname) {
      setNickname(lookup.data.default_nickname)
    }
  }, [lookup.data, nickname])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await register.mutateAsync({
        code: code.toUpperCase(),
        username,
        password,
        nickname,
      })
      navigate('/', { replace: true })
    } catch {
      /* 错误下方显示 */
    }
  }

  const lookupError = lookup.error as
    | { response?: { data?: { detail?: string } } }
    | null
  const lookupErrMsg = lookupError?.response?.data?.detail ?? '邀请码不可用'

  const registerError = register.error as
    | { response?: { data?: Record<string, string[] | string> } }
    | null
  const registerErrMsg = (() => {
    const d = registerError?.response?.data
    if (!d) return null
    if (typeof d === 'string') return d
    const firstKey = Object.keys(d)[0]
    if (!firstKey) return null
    const v = d[firstKey]
    return Array.isArray(v) ? v[0] : v
  })()

  const codeValid = !!lookup.data
  const codeChecking = lookup.isFetching && code.length === 6

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">加入家庭</h1>
          <p className="text-sm text-slate-500 mt-1">凭邀请码注册</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">邀请码</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            maxLength={6}
            minLength={6}
            autoFocus={!params.code}
            placeholder="6 位字母数字"
            className="w-full px-3 py-2 border border-slate-200 rounded-md tracking-widest font-mono text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          {code.length === 6 && (
            <p className="text-xs">
              {codeChecking && <span className="text-slate-400">校验中...</span>}
              {!codeChecking && codeValid && (
                <span className="text-emerald-600">
                  ✓ {lookup.data!.invited_by} 邀请你加入
                  {lookup.data!.note && ` (${lookup.data!.note})`}
                </span>
              )}
              {!codeChecking && lookup.isError && (
                <span className="text-rose-600">{lookupErrMsg}</span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">
            昵称{' '}
            <span className="text-xs text-slate-400">(家人看到的名字)</span>
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={50}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <p className="text-xs text-slate-400">至少 6 位</p>
        </div>

        {register.isError && registerErrMsg && (
          <p className="text-sm text-rose-600">{registerErrMsg}</p>
        )}

        <button
          type="submit"
          disabled={!codeValid || register.isPending}
          className="w-full py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
        >
          {register.isPending ? '注册中...' : '注册并登录'}
        </button>

        <p className="text-center text-sm text-slate-500">
          已有账号?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            登录
          </Link>
        </p>
      </form>
    </div>
  )
}
