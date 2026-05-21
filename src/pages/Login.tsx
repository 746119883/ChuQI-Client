import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const login = useLogin()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync({ username, password })
      navigate('/', { replace: true })
    } catch {
      // 错误显示由组件下方负责
    }
  }

  const errorMsg =
    (login.error as { response?: { data?: { detail?: string } } } | null)?.response?.data
      ?.detail ?? '登录失败,请检查用户名和密码'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">初七</h1>
          <p className="text-sm text-slate-500 mt-1">登录到家庭笔记</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
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
            autoComplete="current-password"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {login.isError && (
          <p className="text-sm text-rose-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2.5 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
        >
          {login.isPending ? '登录中...' : '登录'}
        </button>

        <p className="text-center text-sm text-slate-500">
          还没账号?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            注册
          </Link>
        </p>
      </form>
    </div>
  )
}
