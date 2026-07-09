import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, TrendingUp, Calendar, MapPin, ArrowUpRight, RefreshCw, Lock } from 'lucide-react'
import { useAuthContext } from '../context/AuthContext'
import { type Grant } from '../data/grants'

// ── Skeleton ──────────────────────────────────────────────────
function Bone({ className = '' }: { className?: string }) {
    return <div className={`bg-white/[0.06] rounded animate-pulse ${className}`} />
}

function SkeletonCard() {
    return (
        <div className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 flex flex-col gap-3.5 animate-pulse">
            <div className="flex justify-between">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex gap-2"><Bone className="h-4 w-14" /><Bone className="h-4 w-20" /></div>
                    <Bone className="h-4 w-3/4" />
                    <Bone className="h-3 w-1/3" />
                </div>
                <Bone className="w-8 h-8 rounded-lg flex-shrink-0" />
            </div>
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-4/5" />
            <div className="flex gap-3"><Bone className="h-3 w-24" /><Bone className="h-3 w-20" /></div>
            <Bone className="h-1 w-full rounded-full" />
            <div className="flex justify-between pt-2 border-t border-white/[0.05]">
                <Bone className="h-6 w-24" /><Bone className="h-7 w-20 rounded-lg" />
            </div>
        </div>
    )
}

// ── Recommendation card ───────────────────────────────────────
function RecommendationCard({ grant, index }: { grant: Grant; index: number }) {
    const navigate = useNavigate()
    const [applying, setApplying] = useState(false)
    const [applied,  setApplied]  = useState(false)

    const isUrgent = grant.daysLeft <= 3

    function handleApply(e: React.MouseEvent) {
        e.stopPropagation()
        setApplying(true)
        setTimeout(() => { setApplying(false); setApplied(true) }, 1200)
    }

    return (
        <div
            onClick={() => navigate(`/grant/${grant.id}`)}
            className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 cursor-pointer hover:border-[rgba(0,198,167,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-200 flex flex-col gap-3.5 animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
        >
            {isUrgent && <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-amber-500 to-transparent" />}

            {/* Rank badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-[rgba(0,198,167,0.15)] border border-[rgba(0,198,167,0.3)] text-[#00c6a7] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {index + 1}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[rgba(0,198,167,0.1)] text-[#00c6a7]">
                            {grant.category}
                        </span>
                    </div>
                    <h3 className="text-[14.5px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#00c6a7] transition-colors">
                        {grant.title}
                    </h3>
                    <p className="text-[12px] text-[#3d5a72] mt-0.5 truncate">{grant.provider}</p>
                </div>
            </div>

            <p className="text-[12.5px] text-[#7a9bb5] leading-relaxed line-clamp-2">{grant.description}</p>

            <div className="flex items-center gap-4 text-[12px] text-[#3d5a72]">
                <span className="flex items-center gap-1.5"><Calendar size={12} />{grant.deadline}</span>
                <span className="flex items-center gap-1.5"><MapPin size={12} />{grant.country}</span>
            </div>

            {/* Match bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#00c6a7]" style={{ width: `${grant.matchScore}%` }} />
                </div>
                <span className="text-[11px] whitespace-nowrap">
                    <span className="font-semibold text-[#00c6a7]">{grant.matchScore}%</span>
                    <span className="text-[#3d5a72]"> совпадение</span>
                </span>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
                <span className="text-[19px] font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {grant.currency} {grant.amount}
                </span>
                <button
                    onClick={handleApply}
                    disabled={applying || applied}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-bold rounded-lg transition-all active:scale-95
                        ${applied   ? 'bg-green-600/80 text-white cursor-default'
                        : applying  ? 'bg-[#00c6a7]/70 text-[#07111f] cursor-default'
                        :             'bg-[#00c6a7] text-[#07111f] hover:bg-[#00ddb9]'}`}
                >
                    {applying ? <span className="w-3 h-3 border-2 border-[#07111f]/30 border-t-[#07111f] rounded-full animate-spin" />
                    : applied  ? '✓ Подано'
                    : <>Подать <ArrowUpRight size={12} /></>}
                </button>
            </div>
        </div>
    )
}

// ── Not logged in ─────────────────────────────────────────────
function NotAuthenticated() {
    const navigate = useNavigate()
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#07111f] gap-5">
            <div className="w-16 h-16 bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-center">
                <Lock size={24} className="text-[#3d5a72]" />
            </div>
            <div className="text-center">
                <p className="text-white font-semibold text-[16px]">Войдите, чтобы видеть рекомендации</p>
                <p className="text-[#3d5a72] text-[13px] mt-1 max-w-xs">
                    AI-рекомендации персонализированы под ваш профиль и доступны только авторизованным пользователям
                </p>
            </div>
            <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2.5 bg-[#00c6a7] text-[#07111f] font-bold rounded-xl hover:bg-[#00ddb9] active:scale-95 transition-all text-[14px]"
            >
                Войти или зарегистрироваться
            </button>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────
export default function Recommendations() {
    const { isAuthenticated, authFetch, user } = useAuthContext()
    const [grants,    setGrants]    = useState<Grant[]>([])
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    async function fetchRecommendations(isRefresh = false) {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        setError(null)

        try {
            const res = await authFetch('http://127.0.0.1:8000/api/v1/recommendations')

            if (res.status === 401) {
                setError('Сессия истекла — войдите снова')
                return
            }
            if (!res.ok) throw new Error(`Ошибка ${res.status}`)

            const data = await res.json()
            // Expect array of grants from backend; fall back to local data sorted by matchScore
            setGrants(Array.isArray(data) ? data : [])

        } catch {
            // Backend not connected — fall back to local mock data sorted by matchScore
            const { grants: allGrants } = await import('../data/grants')
            setGrants([...allGrants].sort((a, b) => b.matchScore - a.matchScore))
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated) fetchRecommendations()
    }, [isAuthenticated])

    if (!isAuthenticated) return <NotAuthenticated />

    return (
        <div className="flex-1 overflow-y-auto bg-[#07111f]">
            <div className="px-8 pt-8 pb-0">

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-[rgba(0,198,167,0.12)] rounded-lg flex items-center justify-center">
                                <Sparkles size={14} className="text-[#00c6a7]" />
                            </div>
                            <h1 className="text-[26px] font-bold text-white tracking-tight"
                                style={{ fontFamily: "'Instrument Serif', serif" }}>
                                AI-рекомендации
                            </h1>
                        </div>
                        <p className="text-[14px] text-[#3d5a72]">
                            Подобрано специально для{' '}
                            <span className="text-white font-medium">{user?.name ?? 'вас'}</span>
                            {' '}· PhD · IT · Казахстан
                        </p>
                    </div>

                    <button
                        onClick={() => fetchRecommendations(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 border border-[rgba(255,255,255,0.08)] text-[#7a9bb5] text-[12.5px] font-medium rounded-xl hover:border-[rgba(0,198,167,0.2)] hover:text-white transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        Обновить
                    </button>
                </div>

                {/* AI banner */}
                <div className="px-5 py-3.5 bg-[rgba(0,198,167,0.06)] border border-[rgba(0,198,167,0.2)] rounded-xl flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-[#00c6a7] rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={15} className="text-[#07111f]" />
                    </div>
                    <div className="flex-1">
                        <span className="text-[13px] font-semibold text-[#00c6a7]">Персональная подборка · </span>
                        <span className="text-[13px] text-[#7a9bb5]">
                            ИИ проанализировал ваш профиль и отобрал{' '}
                            <strong className="text-white">{grants.length} наиболее подходящих</strong> возможностей
                        </span>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="px-8 pb-10">
                {error && (
                    <div className="px-4 py-3 bg-red-900/20 border border-red-800/40 rounded-xl text-[13px] text-red-400 mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {loading
                        ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                        : grants.length > 0
                            ? grants.map((g, i) => <RecommendationCard key={g.id} grant={g} index={i} />)
                            : (
                                <div className="col-span-3 text-center py-20 text-[#3d5a72]">
                                    <p className="text-[15px] text-[#7a9bb5] font-medium">Рекомендации пока не готовы</p>
                                    <p className="text-[13px] mt-1">Заполните профиль подробнее, чтобы ИИ мог подобрать гранты</p>
                                </div>
                            )
                    }
                </div>
            </div>
        </div>
    )
}