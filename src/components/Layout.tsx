import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useMe, useLogout } from '@/hooks/useAuth'
import { useReminderChecker } from '@/hooks/useNotifications'
import NotificationBell from './NotificationBell'

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: '动态', end: true },
  { to: '/photos', label: '相册' },
  { to: '/calendar', label: '日历' },
  { to: '/lists', label: '清单' },
  { to: '/notes', label: '笔记' },
  { to: '/meals', label: '吃什么' },
  { to: '/recipes', label: '菜谱' },
  { to: '/trips', label: '旅行' },
  { to: '/stories', label: '故事' },
  { to: '/timeline', label: '时间轴' },
  { to: '/ledger', label: '账本' },
  { to: '/vault', label: '文件柜' },
  { to: '/health', label: '健康' },
]

export default function Layout() {
  const { data: me } = useMe()
  const logout = useLogout()
  // 登录后立即扫一次提醒，之后每 10 分钟自动扫
  useReminderChecker(!!me)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const isAdmin = me?.profile?.role === 'admin'

  const navLinkClsXs = ({ isActive }: { isActive: boolean }) =>
    `text-sm whitespace-nowrap transition-colors ${
      isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'
    }`

  const navLinkClsMobile = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl text-sm transition-colors ${
      isActive ? 'bg-slate-900 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-4">
          {/* 移动端汉堡按钮 */}
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            className="md:hidden shrink-0 p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="菜单"
          >
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="text-lg font-semibold text-slate-900 shrink-0">
            初七
          </Link>

          {/* 桌面端横向导航 */}
          <nav className="hidden md:flex items-center gap-5 overflow-x-auto flex-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClsXs}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* 占位:移动端把右侧推到最右 */}
          <div className="flex-1 md:hidden" />

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

        {/* 移动端下拉菜单面板 */}
        {navOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 top-14 bg-black/20 z-10"
              onClick={() => setNavOpen(false)}
            />
            <nav className="md:hidden absolute left-0 right-0 top-14 bg-white border-b border-slate-200 shadow-lg z-20 p-3 grid grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClsMobile}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </>
        )}
      </header>
      <main className="max-w-3xl mx-auto px-5 py-6">
        <Outlet />
      </main>
    </div>
  )
}
