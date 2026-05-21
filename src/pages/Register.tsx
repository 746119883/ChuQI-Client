import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin, useRegister } from '@/hooks/useAuth'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const register = useRegister()
  const login = useLogin()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await register.mutateAsync({ username, password })
      // 注册成功后自动登录
      await login.mutateAsync({ username, password })
      navigate('/', { replace: true })
    } catch {
      // 错误显示由下方负责
    }
  }

  const errorMsg =
    (register.error as { response?: { data?: { detail?: string } } } | null)?.response
      ?.data?.detail ?? '注册失败'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">注册账号</h1>
          <p className="text-sm text-slate-500 mt-1">加入家庭笔记</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            minLength={2}
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

        {register.isError && (
          <p className="text-sm text-rose-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={register.isPending || login.isPending}
          className="w-full py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
        >
          {register.isPending || login.isPending ? '处理中...' : '注册并登录'}
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
