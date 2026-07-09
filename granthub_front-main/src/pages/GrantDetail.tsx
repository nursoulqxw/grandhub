import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    ArrowLeft, Calendar, MapPin, TrendingUp, Bookmark,
    ArrowUpRight, Tag, Building2, Globe, Clock, CheckCircle,
    AlertTriangle, Sparkles, Share2, ExternalLink
} from 'lucide-react'
import { grants } from '../data/grants'

const categoryColors: Record<string, string> = {
    'Наука':       'bg-blue-900/30 text-blue-400 border-blue-800/40',
    'Образование': 'bg-purple-900/30 text-purple-400 border-purple-800/40',
    'IT / Tech':   'bg-[rgba(0,198,167,0.1)] text-[#00c6a7] border-[rgba(0,198,167,0.2)]',
    'Инновации':   'bg-orange-900/30 text-orange-400 border-orange-800/40',
    'Общество':    'bg-pink-900/30 text-pink-400 border-pink-800/40',
}

const statusConfig = {
    open:    { label: 'Открыт',  classes: 'bg-green-900/30 text-green-400 border-green-800/50',               icon: CheckCircle  },
    closing: { label: 'Скоро',   classes: 'bg-amber-900/30 text-amber-400 border-amber-800/50',               icon: AlertTriangle },
    new:     { label: 'Новый',   classes: 'bg-[rgba(0,198,167,0.1)] text-[#00c6a7] border-[rgba(0,198,167,0.2)]', icon: Sparkles },
}

function matchMeta(score: number) {
    if (score >= 90) return { color: 'text-[#00c6a7]', bar: 'bg-[#00c6a7]', label: 'Отличное совпадение' }
    if (score >= 75) return { color: 'text-blue-400',  bar: 'bg-blue-400',  label: 'Хорошее совпадение'  }
    return              { color: 'text-[#7a9bb5]',     bar: 'bg-[#3d5a72]', label: 'Совпадение'           }
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-6">
            <h2 className="text-[14px] font-semibold text-[#7a9bb5] uppercase tracking-wider mb-4">{title}</h2>
            {children}
        </div>
    )
}

// ── Info row ──────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
            <div className="w-7 h-7 rounded-lg bg-[#07111f] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={13} className="text-[#3d5a72]" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#3d5a72] uppercase tracking-wider">{label}</p>
                <p className="text-[13.5px] text-white mt-0.5">{value}</p>
            </div>
        </div>
    )
}

// ── Related grant card ────────────────────────────────────────
function RelatedCard({ grant }: { grant: (typeof grants)[0] }) {
    const navigate = useNavigate()
    const catColor = categoryColors[grant.category] ?? 'bg-white/5 text-white/50 border-white/5'
    return (
        <div
            onClick={() => navigate(`/grant/${grant.id}`)}
            className="bg-[#07111f] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 cursor-pointer hover:border-[rgba(0,198,167,0.25)] hover:-translate-y-0.5 transition-all duration-150 flex flex-col gap-2.5"
        >
            <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${catColor}`}>
                    {grant.category}
                </span>
            </div>
            <p className="text-[13px] font-semibold text-white leading-snug line-clamp-2 hover:text-[#00c6a7] transition-colors">
                {grant.title}
            </p>
            <p className="text-[11.5px] text-[#3d5a72]">{grant.provider}</p>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[14px] font-bold text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {grant.currency} {grant.amount}
                </span>
                <span className="text-[11px] font-semibold text-[#00c6a7]">{grant.matchScore}%</span>
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────
export default function GrantDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [saved, setSaved] = useState(false)
    const [applying, setApplying] = useState(false)
    const [applied, setApplied] = useState(false)
    const [copied, setCopied] = useState(false)

    const grant = grants.find(g => g.id === Number(id))

    // ── 404 ──
    if (!grant) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#07111f] gap-4">
                <div className="w-16 h-16 bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center justify-center text-3xl">
                    🔍
                </div>
                <p className="text-white font-semibold text-[16px]">Грант не найден</p>
                <p className="text-[#3d5a72] text-[13px]">Возможно, он был удалён или ссылка неверна</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-2 px-5 py-2.5 bg-[#00c6a7] text-[#07111f] font-bold rounded-xl hover:bg-[#00ddb9] active:scale-95 transition-all text-[13.5px]"
                >
                    На главную
                </button>
            </div>
        )
    }

    const status   = statusConfig[grant.status]
    const StatusIcon = status.icon
    const catColor = categoryColors[grant.category] ?? 'bg-white/5 text-white/50 border-white/5'
    const match    = matchMeta(grant.matchScore)
    const isUrgent = grant.daysLeft <= 3

    const related = grants.filter(g => g.id !== grant.id && g.category === grant.category).slice(0, 2)

    function handleApply() {
        setApplying(true)
        setTimeout(() => { setApplying(false); setApplied(true) }, 1200)
    }

    function handleShare() {
        navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex-1 overflow-y-auto bg-[#07111f]">
            <div className="max-w-5xl mx-auto px-8 py-8">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[13px] text-[#3d5a72] hover:text-white transition-colors mb-6 group"
                >
                    <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    Назад
                </button>

                <div className="flex gap-6 items-start">

                    {/* ── Left column ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5">

                        {/* Hero */}
                        <div className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 animate-fade-in-up" style={{ animationFillMode: 'both' }}>

                            {/* Urgent stripe */}
                            {isUrgent && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 border border-amber-800/40 rounded-lg mb-4 text-[12.5px] text-amber-400 font-semibold">
                                    <AlertTriangle size={13} />
                                    Дедлайн через {grant.daysLeft} дн. — не упустите!
                                </div>
                            )}

                            {/* Badges */}
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md border ${status.classes}`}>
                                    <StatusIcon size={11} />
                                    {status.label}
                                </span>
                                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-md border ${catColor}`}>
                                    {grant.category}
                                </span>
                            </div>

                            {/* Title */}
                            <h1
                                className="text-[24px] font-bold text-white leading-tight tracking-tight mb-1"
                                style={{ fontFamily: "'Instrument Serif', serif" }}
                            >
                                {grant.title}
                            </h1>
                            <p className="text-[13px] text-[#3d5a72] mb-5">{grant.provider}</p>

                            {/* Description */}
                            <p className="text-[14px] text-[#7a9bb5] leading-relaxed">
                                {grant.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mt-5">
                                {grant.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-[11.5px] px-2.5 py-1 bg-white/[0.04] text-[#7a9bb5] rounded-md border border-white/[0.06] hover:border-[rgba(0,198,167,0.2)] hover:text-[#00c6a7] transition-colors cursor-default">
                                        <Tag size={10} />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Match score */}
                        <div className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-[rgba(0,198,167,0.1)] rounded-lg flex items-center justify-center">
                                        <TrendingUp size={13} className="text-[#00c6a7]" />
                                    </div>
                                    <span className="text-[14px] font-semibold text-white">AI-совпадение с вашим профилем</span>
                                </div>
                                <span className={`text-[22px] font-bold ${match.color}`} style={{ fontFamily: "'Instrument Serif', serif" }}>
                                    {grant.matchScore}%
                                </span>
                            </div>
                            <div className="h-2 bg-[#07111f] rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${match.bar}`}
                                    style={{ width: `${grant.matchScore}%` }}
                                />
                            </div>
                            <p className="text-[12px] text-[#3d5a72] mt-2">{match.label} · на основе вашего профиля «PhD · IT · Казахстан»</p>
                        </div>

                        {/* Related */}
                        {related.length > 0 && (
                            <div className="animate-fade-in-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
                                <p className="text-[12px] font-semibold text-[#3d5a72] uppercase tracking-wider mb-3">
                                    Похожие гранты
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {related.map(g => <RelatedCard key={g.id} grant={g} />)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right sidebar ── */}
                    <div className="w-72 flex-shrink-0 flex flex-col gap-4 sticky top-4">

                        {/* Amount + CTA */}
                        <div className="bg-[#0c1e33] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 animate-fade-in-up" style={{ animationFillMode: 'both' }}>
                            <p className="text-[12px] text-[#3d5a72] font-semibold uppercase tracking-wider mb-1">Сумма гранта</p>
                            <p className="text-[32px] font-bold text-white leading-none mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
                                {grant.currency} {grant.amount}
                            </p>

                            {/* Apply button */}
                            <button
                                onClick={handleApply}
                                disabled={applying || applied}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] transition-all duration-150 active:scale-[0.98] mb-2
                                    ${applied
                                        ? 'bg-green-600/80 text-white cursor-default'
                                        : applying
                                            ? 'bg-[#00c6a7]/70 text-[#07111f] cursor-default'
                                            : 'bg-[#00c6a7] text-[#07111f] hover:bg-[#00ddb9]'
                                    }`}
                            >
                                {applying ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-[#07111f]/30 border-t-[#07111f] rounded-full animate-spin" />
                                        Отправка…
                                    </>
                                ) : applied ? (
                                    <><CheckCircle size={15} /> Заявка подана!</>
                                ) : (
                                    <>Подать заявку <ArrowUpRight size={15} /></>
                                )}
                            </button>

                            {/* Secondary actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSaved(s => !s)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[12.5px] font-medium transition-all duration-150
                                        ${saved
                                            ? 'bg-[rgba(0,198,167,0.12)] border-[rgba(0,198,167,0.3)] text-[#00c6a7]'
                                            : 'border-[rgba(255,255,255,0.08)] text-[#7a9bb5] hover:border-[rgba(0,198,167,0.2)] hover:text-white'
                                        }`}
                                >
                                    <Bookmark size={13} className={saved ? 'fill-[#00c6a7]' : ''} />
                                    {saved ? 'Сохранено' : 'Сохранить'}
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-[#7a9bb5] text-[12.5px] font-medium hover:border-[rgba(0,198,167,0.2)] hover:text-white transition-all duration-150"
                                >
                                    {copied ? <><CheckCircle size={13} className="text-[#00c6a7]" /> Скопировано</> : <><Share2 size={13} /> Поделиться</>}
                                </button>
                            </div>
                        </div>

                        {/* Details */}
                        <Section title="Детали">
                            <InfoRow icon={Calendar}  label="Дедлайн"      value={
                                <span className="flex items-center gap-2">
                                    {grant.deadline}
                                    {isUrgent && <span className="text-amber-400 font-bold text-[12px] animate-pulse">{grant.daysLeft} дн.!</span>}
                                    {!isUrgent && grant.daysLeft <= 14 && <span className="text-amber-400 text-[12px]">{grant.daysLeft} дн.</span>}
                                </span>
                            } />
                            <InfoRow icon={Clock}     label="Осталось"     value={`${grant.daysLeft} дней`} />
                            <InfoRow icon={MapPin}    label="Страна"        value={grant.country} />
                            <InfoRow icon={Building2} label="Организация"   value={grant.provider} />
                            <InfoRow icon={Globe}     label="Категория"     value={grant.category} />
                        </Section>

                        {/* External link */}
                        <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-[rgba(255,255,255,0.08)] text-[#7a9bb5] text-[12.5px] font-medium rounded-xl hover:border-[rgba(0,198,167,0.2)] hover:text-white transition-all duration-150">
                            <ExternalLink size={13} />
                            Открыть официальный сайт
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}