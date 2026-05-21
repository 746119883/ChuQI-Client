import { Link, NavLink, Outlet } from 'react-router-dom'
import { useMe, useLogout } from '@/hooks/useAuth'

export default function Layout() {
  const { data: me } = useMe()
  const logout = useLogout()

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${
      isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
    }`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold text-slate-900">
              初七
            </Link>
            <nav className="flex items-center gap-5">
              <NavLink to="/" end className={navLinkCls}>
                动态
              </NavLink>
              <NavLink to="/photos" className={navLinkCls}>
                相册
              </NavLink>
              <NavLink to="/calendar" className={navLinkCls}>
                日历
              </NavLink>
              <NavLink to="/lists" className={navLinkCls}>
                清单
              </NavLink>
              <NavLink to="/notes" className={navLinkCls}>
                笔记
              </NavLink>
              <NavLink to="/vault" className={navLinkCls}>
                文件柜
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {me ? (
              <>
                <span className="text-slate-500 hidden sm:inline">
                  你好,{me.username}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-900"
                >
                  退出
                </button>
              </>
            ) : (
              <Link to="/login" className="text-blue-600 hover:underline">
                登录
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-5 py-6">
        <Outlet />
      </main>
    </div>
  )
}
