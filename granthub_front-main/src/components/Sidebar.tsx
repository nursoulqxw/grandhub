import {
    LayoutDashboard, Search, Star, FileText,
    BarChart2, Settings, GraduationCap, Briefcase, ChevronRight
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

type NavItemType = {
    icon: React.ElementType
    label: string
    badge?: string
    badgeColor?: string
    path?: string
}

const navItems: NavItemType[] = [
    { icon: LayoutDashboard, label: 'Главная',      path: '/dashboard' },
    { icon: Search,          label: 'Поиск грантов', badge: '12K+',    path: '/dashboard' },
    { icon: GraduationCap,   label: 'Стипендии' },
    { icon: Briefcase,       label: 'Стажировки' },
    { icon: Star,            label: 'Избранное',     badge: '3' },
]

const appItems: NavItemType[] = [
    { icon: FileText,     label: 'Активные',  badge: '2', badgeColor: 'amber' },
    { icon: ChevronRight, label: 'Поданные' },
    { icon: FileText,     label: 'Черновики' },
]

const bottomItems: NavItemType[] = [
    { icon: BarChart2, label: 'Аналитика', path: '/analytics' },
    { icon: Settings,  label: 'Профиль',   path: '/profile'   },
]

function NavItem({ icon: Icon, label, badge, badgeColor, path }: NavItemType) {
    const navigate = useNavigate()
    const location = useLocation()
    const active = !!path && location.pathname === path

    return (
        <div
            onClick={() => path && navigate(path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150
        ${active
                ? 'bg-[rgba(0,198,167,0.12)] text-[#00c6a7] border border-[rgba(0,198,167,0.2)]'
                : 'text-[#7a9bb5] hover:bg-[#0c1e33] hover:text-white'
            }`}
        >
            <Icon size={16} className="flex-shrink-0" />
            <span className="text-[13.5px] font-medium flex-1">{label}</span>
            {badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
          ${badgeColor === 'amber'
                    ? 'bg-amber-900/40 text-amber-400'
                    : active
                        ? 'bg-[rgba(0,198,167,0.15)] text-[#00c6a7]'
                        : 'bg-[#0c1e33] text-[#7a9bb5]'
                }`}>
          {badge}
        </span>
            )}
        </div>
    )
}

export default function Sidebar() {
    const navigate = useNavigate()

    return (
        <aside className="w-60 bg-[#050e1a] border-r border-[rgba(255,255,255,0.06)] flex flex-col h-screen sticky top-0">

            {/* Logo */}
            <div
                className="px-5 py-5 border-b border-[rgba(255,255,255,0.06)] cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#00c6a7] rounded-lg flex items-center justify-center text-[#07111f] font-bold text-sm flex-shrink-0"
                         style={{ fontFamily: "'Instrument Serif', serif" }}>
                        G
                    </div>
                    <span className="text-[17px] text-white"
                          style={{ fontFamily: "'Instrument Serif', serif" }}>
            Grant<span className="text-[#00c6a7]">Hub</span>.AI
          </span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto">
                <div className="space-y-0.5">
                    {navItems.map(item => <NavItem key={item.label} {...item} />)}
                </div>

                <div className="mt-5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#3d5a72] px-3 mb-2">
                        Мои заявки
                    </p>
                    <div className="space-y-0.5">
                        {appItems.map(item => <NavItem key={item.label} {...item} />)}
                    </div>
                </div>

                <div className="mt-5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[#3d5a72] px-3 mb-2">
                        Прочее
                    </p>
                    <div className="space-y-0.5">
                        {bottomItems.map(item => <NavItem key={item.label} {...item} />)}
                    </div>
                </div>
            </nav>

            {/* User */}
            <div className="px-3 py-3 border-t border-[rgba(255,255,255,0.06)]">
                <div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0c1e33] cursor-pointer transition-all"
                    onClick={() => navigate('/profile')}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00c6a7] to-[#7c3aed] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        АИ
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">Алуа</p>
                        <p className="text-[11px] text-[#3d5a72] truncate">alua@gmail.com</p>
                    </div>
                    <Settings size={14} className="text-[#3d5a72] flex-shrink-0" />
                </div>
            </div>
        </aside>
    )
}