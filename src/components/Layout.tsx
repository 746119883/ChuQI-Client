import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useMe, useLogout } from '@/hooks/useAuth'
import { useReminderChecker } from '@/hooks/useNotifications'
import NotificationBell from './NotificationBell'

export default function Layout() {
  const { data: me } = useMe()
  const logout = useLogout()
  // 登录后立即扫一次提醒，之后每 10 分钟自动扫
  useReminderChecker(!!me)
  const [menuOpen, setMenuOpen] = useState(false)
  const isAdmin = me?.profile?.role === 'admin'

  const navLinkClsXs = ({ isActive }: { isActive: boolean }) =>
    `text-sm whitespace-nowrap transition-colors ${
      isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
    }`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold text-slate-900 shrink-0">
            初七
          </Link>
          {/* 横向可滚动导航，隐藏滚动条 */}
          <nav className="flex items-center gap-5 overflow-x-auto flex-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <NavLink to="/" end className={navLinkClsXs}>动态</NavLink>
            <NavLink to="/photos" className={navLinkClsXs}>相册</NavLink>
            <NavLink to="/calendar" className={navLinkClsXs}>日历</NavLink>
            <NavLink to="/lists" className={navLinkClsXs}>清单</NavLink>
            <NavLink to="/notes" className={navLinkClsXs}>笔记</NavLink>
            <NavLink to="/meals" className={navLinkClsXs}>吃什么</NavLink>
            <NavLink to="/recipes" className={navLinkClsXs}>菜谱</NavLink>
            <NavLink to="/trips" className={navLinkClsXs}>旅行</NavLink>
            <NavLink to="/stories" className={navLinkClsXs}>故事</NavLink>
            <NavLink to="/timeline" className={navLinkClsXs}>时间轴</NavLink>
            <NavLink to="/ledger" className={navLinkClsXs}>账本</NavLink>
            <NavLink to="/vault" className={navLinkClsXs}>文件柜</NavLink>
          </nav>
          <div className="shrink-0 flex items-center gap-1">

          {me ? (
            <>
              <NotificationBell />
              <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="flex items-center gap-2 text-sm"
              >
                <span className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 text-xs">
                  {me.avatar_url ? (
                    <img src={me.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    me.display_name.slice(0, 1)
                  )}
                </span>
                <span className="text-slate-700 hidden sm:inline">{me.display_name}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-40 bg-white border border-slate-200 rounded-md shadow-md py-1 text-sm">
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    个人资料
                  </Link>
                  <Link
                    to="/family"
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    家庭成员{isAdmin && ' / 邀请'}
                  </Link>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      logout()
                    }}
                    className="block w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    退出登录
                  </button>
                </div>
              )}
              </div>
            </>
          ) : (
            <Link to="/login" className="text-xs text-blue-600 hover:underline">
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
