import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, MessageCircle, User, Shield, GitBranch, BookOpen } from 'lucide-react'

const tabs = [
  { path: '/', label: '工作台', icon: Home },
  { path: '/reception', label: '话术', icon: MessageCircle },
  { path: '/profile', label: '画像', icon: User },
  { path: '/risk', label: '风险', icon: Shield },
  { path: '/triage', label: '分诊', icon: GitBranch },
  { path: '/review', label: '复盘', icon: BookOpen },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-[#faf9f7]">
      <main className="flex-1 pb-20 overflow-y-auto scrollbar-hide">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 safe-bottom z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center gap-0.5 w-16 py-1 transition-all duration-200"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-gold-100 scale-110' : ''
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-gold-600' : 'text-gray-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-gold-700' : 'text-gray-400'
                  }`}
                >
                  {tab.label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
